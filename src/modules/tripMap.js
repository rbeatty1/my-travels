import mapboxgl from "../../node_modules/mapbox-gl"
import "../../node_modules/mapbox-gl/dist/mapbox-gl.css"
import Home from "./home";
import * as aria from '../utils/aria.js'


/*
    ChangeExtent(map, features, check)
    @purpose: Changes map extent to focus on queried features
    @params:
        map: mapbox-gl map component
        features: queried features
        check (optional): trip_id to check kagainst to make sure the function grabs the correct coordinates
*/
const ChangeExtent = (map, features, check) =>{
    let bounds = new mapboxgl.LngLatBounds()
    // iterate through features and grab coordinates for the appropriate ones, and add to mapbox-gl bounds object
    features.features.map(feature=> {
        if (check){
            if (feature.properties.trip == check) bounds.extend(feature.geometry.coordinates)
        }
        else bounds.extend(feature.geometry.coordinates)
    })

    // move map to center on rendered features, plus a little extra
    map.fitBounds(bounds, { padding: 200 })
}

/*
    BuildMap(component)
    @purpose: Build mapbox-gl component
    @params:
        component: page component state to access global variables
    @return:
        doesn't really return anything, but set's component <component.state.map> = mapbox-gl object
*/
const BuildMap = component =>{

    /*
        GeneratePopup(event, map)
        @purpose: build popup based on clicked feature
        @params:
            event: data from click event
            map: mapbox-gl map component that the popup will be added to
    */
    const GeneratePopup = (event, map) =>{
        // feature properties
        let props = event.features[0].properties

        // highlight clicked feature
        map.setFilter('travel-locations-highlight', ['==', ['get', 'id'], ['to-number', props.id]])

        // get feature type color
        let colors = map.getPaintProperty('travel-locations', 'circle-color')
        colors.map((color, index)=>{ if (color == props.type){ props.color = colors[index+1] } })

        // general popup options
        let popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: true,
            offset: {
              top: [0, 0],
              "top-left": [0, 0],
              "top-right": [0, 0],
              bottom: [0, -10],
              "bottom-left": [0, 0],
              "bottom-right": [0, 0],
              left: [0, 0],
              right: [0, 0]
            },
            className: 'travels-popup'
        })

        // set anchor to click location
        popup.setLngLat(event.lngLat)
        // create popup content
        popup.setHTML(`<p><strong style="color: ${props.color}">${props.name}</strong> ${props.type}</p><p class="address">${props.address} ${props.city}, ${props.state}</p>`)
        // reset map filter when popup closes
        popup.on('close', e=>{map.setFilter('travel-locations-highlight', ['==', ['get', 'id'], ''])})
        popup.addTo(map)
    }

    // add map container to page
    component.container.id = 'map'
    component.app.appendChild(component.container)

    mapboxgl.accessToken = 'pk.eyJ1IjoiYmJlYXR6MSIsImEiOiJjanQxb2dnMmgwb29vNGFwZG4xdXRxd25nIn0.CiPPL5rxchYwsCN0nTHfCQ'

    // build map
    let map = new mapboxgl.Map({
        center: [-91.698, 41.032],
        zoom: 3,
        style: 'mapbox://styles/mapbox/streets-v9',
        container: component.container
    })

    map.on('load', ()=>{
        map.resize()

        // grab all locations data from api
        fetch(`http://localhost:5000/api/locations/all`)
        .then(data=> {if (data.ok) return data.json()})
        .then(locations=>{
            let source = {
                type: 'geojson',
                data: locations
            }

            // define layer properties
                // visible layer, highlight layer
            let layers = [
                {
                    id: "travel-locations",
                    source: 'locations',
                    type: 'circle',
                    filter: ['==', ['get', 'trip'], ['to-number', component.trip]], // filter locations from specified trip
                    paint: {
                        'circle-color': [
                            'match',
                            ['get', ['downcase', 'type']],
                            'Brewery', '#6a3d9a',
                            'Cidery', '#ffff99',
                            'Winery', '#cab2d6',
                            'Park', '#33a02c',
                            'Sightseeing', '#e31a1c',
                            'Travel', '#b15928',
                            'Store', '#fdbf6f',
                            'Bar', '#fb9a99',
                            'Concert', '#b2df8a',
                            'Lodging', '#a6cee3',
                            'Restaurant', '#1f78b4',
                            'Museum', '#ff7f00',
                            '#ffffff'

                        ],
                        'circle-radius': [
                            'interpolate',
                            ['linear'], ['zoom'],
                            3, 5,
                            12, 10
                        ],
                        'circle-stroke-width': [
                            'interpolate',
                            ['linear'], ['zoom'],
                            3, 2.5,
                            12, 5
                        ],
                        'circle-stroke-color': '#fff'
                    }
                },
                {
                    id: 'travel-locations-highlight',
                    type: 'circle',
                    source: 'locations',
                    filter: ['==', ['get', 'id'], ''],
                    paint: {
                        'circle-color': 'rgba(0,0,0,0)',
                        'circle-stroke-color': '#0ff',
                        'circle-stroke-width': 4,
                        'circle-radius': [
                            'interpolate',
                            ['linear'], ['zoom'],
                            3, 5,
                            12, 10
                        ]
                    }
                }
            ]

            // send it
            map.addSource('locations', source)
            layers.map(layer=> {map.addLayer(layer)} )

            // zoom to trip location
            ChangeExtent(map, locations, component.trip)
        })
    })

    map.on('mouseover', 'travel-locations', e=>{map.getCanvas().style.cursor = "pointer"})
    map.on('mouseleave', 'travel-locations', e=>{map.getCanvas().style.cursor = ""})

    map.on('click', 'travel-locations', e=>{ GeneratePopup(e, map) })

    component.map = map
}

/*
    BuildNav(component)
    @purpose: Builds app page header
    @params:
        component: page state data
*/

const BuildNav = component =>{
    /*
        BuildDropdown(container)
        @purpose: Builds dropdown form to quickly jump from trip to trip
        @params:
            container: header container that the form will be appended to
    */
    const BuildDropdown = container =>{

        // bob the builder
        let form = document.createElement('form'),
            select = document.createElement('select')
        
        // housekeeping
        select.name = 'Locations'
        select.innerText = select.name

        let all = document.createElement('option')
        all.value = 0
        all.innerText = 'All Locations'
        select.appendChild(all)

        // grab all trip data from api
        fetch('http://localhost:5000/api/trips/all')
        .then(data=> { if (data.ok) return data.json() })
        .then(trips=>{
            // build dropdown option for each one
            for (let location in trips){
                let option = document.createElement('option')
                option.value = trips[location].id
                option.innerText = location
                if (option.value == component.trip) option.selected = true
                select.appendChild(option)
            }
        })

        // listener for when you use the dropdown form
        form.onchange = e =>{
            // define map
            let map = component.map

            // 0 == all locations
            if (e.target.value != 0){
                // change filter
                map.setFilter('travel-locations', ['==', ['get', 'trip'],['to-number', e.target.value]])
                // get respective coordinates and change map extent
                fetch(`http://localhost:5000/api/locations?trip_id=${parseInt(e.target.value)}`)
                .then(data=> { if (data.ok) return data.json() })
                .then(features=>{ChangeExtent(map, features) })
            }
            // do the same, except don't filter and grab all locations
            else{
                map.setFilter('travel-locations', undefined)
                fetch(`http://localhost:5000/api/locations/all`)
                .then(data=> { if (data.ok) return data.json() })
                .then(features=>{ 
                    ChangeExtent(map, features) })
            }
        }

        form.appendChild(select)
        container.appendChild(form)
    }

    /*
        ModalLinks(header)
        @purpose: build the header links to open the modals
        @params:
            header: header element
    */

    const ModalLinks = header =>{
        // define the different modals
        let links = ['Legend', 'Stats'],
            container = document.createElement('div')

        container.id = 'modal-links'


        // actually build the links w/ actions
        links.map(link=>{
            let a = document.createElement('a'),
                modal = document.createElement('div'),
                close = document.createElement('span')

            a.innerText = link
            a.href = `#${link.toLowerCase()}-modal`
            a.rel = 'noopener'
            a.classList.add('modal-link')

            modal.id = `${link.toLowerCase()}-modal`
            modal.classList.add('modal')
    
            close.onclick = e=>{
                let modal = e.target.parentNode
                aria.AriaHide(modal)
            }
            close.innerHTML = '&times;'
            close.classList = 'close-modal'
            modal.appendChild(close)

            a.onclick = e=>{
                let modals = document.querySelectorAll('.modal')
                for (let m of modals) if (m.classList.contains('active')) aria.AriaHide(m)
                if (!modal.classList.contains('active')) aria.AriaShow(modal)
                else aria.AriaHide(modal)
            }

            container.appendChild(a)
            container.appendChild(modal)
        })

        header.appendChild(container)

    }

    // build home link
    let nav = document.createElement('header'),
        home = document.createElement('a')

    home.href = '#'
    home.rel = 'noopener'
    home.innerText = 'home'
    home.onclick = e=>{
        let body = document.querySelector('body'),
            app = document.createElement('main')

        while (body.firstChild) body.removeChild(body.firstChild)
        app.id = 'app'
        body.appendChild(app)
        new Home()
    }

    nav.appendChild(home)
    ModalLinks(nav)
    BuildDropdown(nav)
    component.app.appendChild(nav)
}


/*
    BuildLegend(map)
    @purpose: build the map legend based on the travel-locations paint property
*/
const BuildLegend = map =>{
    // wait for map to finish loading
    map.on('idle', e=>{
        if (!map.loaded) return
        let legend = document.getElementById('legend-modal')

        if (!legend.querySelector('ul')){
            // housekeeping,
                let colors = map.getPaintProperty('travel-locations', 'circle-color'),
                    legendItems = document.createElement('ul')
            
            // build the legend items
            colors.map((color, index)=>{
                // make sure it's not the default, and is actually a color
                if (color[0] === '#' && color != '#ffffff'){
                    let row = document.createElement('li'),
                        icon = document.createElement('span'),
                        label = document.createElement('p')
    
                    row.classList.add('legend-row')
    
                    icon.classList.add('legend-icon')
                    icon.style.backgroundColor = color
    
                    // grab the previous item from paint array because that's the label
                    label.innerText = colors[index-1]
    
                    row.appendChild(icon)
                    row.appendChild(label)
    
                    legendItems.appendChild(row)
                }
            })
    
            legendItems.classList.add('legend-list')
            legend.appendChild(legendItems)

        }
    })
}


export default class TripMap{
    constructor(props){
        this.state = {
            trip : props,
            container: document.createElement('main'),
            app: document.querySelector('body')
        }

        this.render()
    }
    render(){
        while (this.state.app.firstChild){ this.state.app.removeChild(this.state.app.firstChild)}
        BuildNav(this.state)
        BuildMap(this.state)
        BuildLegend(this.state.map)
    }
}