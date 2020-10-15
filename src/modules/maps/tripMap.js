import mapboxgl from "mapbox-gl";
import "../../../node_modules/mapbox-gl/dist/mapbox-gl.css";
import Home from "../home/home";
import * as aria from '../../utils/aria.js';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import * as i from '@primer/octicons';


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
    map.fitBounds(bounds, { padding: 200 , linear: false})
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
    while(document.getElementById("map")) component.container.removeChild(document.getElementById("map"));
    let mapEl = document.createElement("div");
    mapEl.id = 'map'
    component.container.appendChild(mapEl);

    mapboxgl.accessToken = 'pk.eyJ1IjoiYmJlYXR6MSIsImEiOiJjanQxb2dnMmgwb29vNGFwZG4xdXRxd25nIn0.CiPPL5rxchYwsCN0nTHfCQ'

    // build map
    let map = new mapboxgl.Map({
        center: [-91.698, 41.032],
        zoom: 3,
        style: 'mapbox://styles/mapbox/streets-v9',
        container: mapEl
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
    component.app.appendChild(component.container)
}

/*
    BuildNav(component)
    @purpose: Builds app page header
    @params:
        component: page state data
*/

const BuildNav = component =>{
    /*
        BuildLocationDropdown(container)
        @purpose: Builds dropdown form to quickly jump from trip to trip
        @params:
            container: header container that the form will be appended to
    */
    const BuildLocationDropdown = container =>{

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

    let toggleLegendFn = component.toggleLegend;
    component = component.state;

    // build home link
    let nav = document.createElement('aside'),
        home = document.createElement('span'),
        collapse = document.createElement('span');

    home.insertAdjacentHTML("afterbegin", i.home.toSVG( { width : 33, height : 33 } ));
    home.onclick = e=>{
        let body = document.querySelector('body'),
            app = document.createElement('main')

        while (body.firstChild) body.removeChild(body.firstChild)
        app.id = 'app'
        body.appendChild(app)
        new Home()
    }
    home.classList.add("icon")
    collapse.classList.add("icon", "collapse")

    collapse.insertAdjacentHTML("afterbegin", i[component.showLegend ? "chevron-left" : "chevron-right"].toSVG( { width : 33, height : 33 } ))

    collapse.addEventListener("click", toggleLegendFn);

    nav.appendChild(home)
    component.showLegend && BuildLocationDropdown(nav);
    nav.appendChild(collapse)

    component.container.insertAdjacentElement("afterbegin", nav)
}


/*
    BuildLegend(map)
    @purpose: build the map legend based on the travel-locations paint property
*/

const BuildLegend = component =>{
    // wait for map to finish loading
    component.map && component.map.on('idle', e=>{
        if (document.querySelector(".legend-list")) document.querySelector("aside").removeChild(document.querySelector(".legend-list"));  
        let map = component.map;
        if (!component.map.loaded) return
        let colors = map.getPaintProperty('travel-locations', 'circle-color'),
            legendItems = document.createElement('ul')

        let bbox = map.getBounds();
        let featureTypes = map.queryRenderedFeatures(bbox).filter( x=> x.layer.id == "travel-locations").map( x=> x.properties.type);
        
        
        // build the legend items
        colors.map((color, index)=>{
            if( index < 2 || featureTypes.indexOf(colors[index-1]) == -1) return;
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

        component.showLegend && component.container.querySelector("aside form").insertAdjacentElement("afterend", legendItems);

    })

}




export default class TripMap{
    constructor(props){
        this.state = {
            trip : props,
            container: document.createElement('main'),
            app: document.querySelector('body'),
            showLegend : true
        }

        this.render = this.render.bind(this);
        this.toggleLegend = this.toggleLegend.bind(this);
        this.render()
    }
    render(){
        while (this.state.app.firstChild){ this.state.app.removeChild(this.state.app.firstChild)}
        BuildNav(this)
        BuildMap(this.state)
        this.state.showLegend && BuildLegend(this.state);
    }

    toggleLegend(){
        while(this.state.container.querySelector("aside")) this.state.container.removeChild(this.state.container.querySelector("aside"));
        this.state.showLegend = !this.state.showLegend;
        BuildNav(this);
        document.getElementById("map").classList.toggle("show-legend", this.state.showLegend);
        this.state.map.resize();
        this.state.showLegend && BuildLegend(this.state);

    }
}