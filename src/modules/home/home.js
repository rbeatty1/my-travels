import './home.css'
import TripMap from '../maps/tripMap';
import * as aria from '../../utils/aria.js'

/*
    BuildHomePage()
    @purpose: rendering function for the homepage
*/
const BuildHomePage = ()=>{
    // grab all of the trip information from the API
    fetch('http://localhost:5000/api/trips/all')
    .then(data=> { if (data.ok) return data.json()})
    .then(trips=>{
        // make a list item for each trip
        for (let trip in trips){
            // get relevant data 
            let data = trips[trip],
                listItem = document.createElement('li'),
                listContainer = document.getElementById('list'),
                tripIcons = document.createElement('div')

            // make the list tem
            listItem.innerText = `${trip}, ${data.state}`
            listItem.setAttribute('data-trip', data.id)

            // container to build the little icons symbolizing what kind of trip it was
                // TODO: tooltips to show which kind of trip it is on icon hover
            tripIcons.classList.add('icon-container')

            // make the trip type icon
            data.type.map(tripType=>{
                let circle = document.createElement('span')
                circle.classList = `trip-icon ${tripType.toLowerCase()}`
                circle.setAttribute('data-type', tripType.toLowerCase())
                circle.setAttribute('title', tripType)
                tripIcons.appendChild(circle)
            })

            // load map page on click w/ clicked trip data
            listItem.onclick = e =>{
                let trip = e.target.getAttribute('data-trip')
                new TripMap(trip)
            }

            // send 'em
            listItem.insertAdjacentHTML('beforeend', tripIcons.outerHTML)
            listContainer.appendChild(listItem)
        }
    })
}


export default class Home{
    constructor(){
        let app = document.getElementById('app'),
            section = document.createElement('section'),
            header = document.createElement('h1'),
            list = document.createElement('ul')

        header.innerText = 'Where do you want to go?'

        section.appendChild(header)

        list.id = 'list'

        section.appendChild(list)

        app.appendChild(section)
        this.render()
    }

    render(){
        BuildHomePage()
    }
}