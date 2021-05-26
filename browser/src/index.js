import './styles.css'

import axios from 'axios'

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// hack so that leaflet marker images work after going through webpack
import marker from 'leaflet/dist/images/marker-icon.png';
import marker2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import crocSvg from './croc.svg'


delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: crocSvg,
    iconUrl: crocSvg,
    shadowUrl: markerShadow,
    shadowSize: [0,0]
})



const mapId = 'map'
const mapBoxToken = '{your mapbox token}'

/**
*	Tile options:
*	'mapbox/streets-v11'
*	'mapbox/outdoors-v9'
*	'mapbox/light-v9'
*	'mapbox/dark-v9'
**/

document.addEventListener("DOMContentLoaded",function(){

	// init the map
	const mymap = L.map(mapId).setView([51.505, -0.09], 13)


	// add our tile layer
	L.tileLayer(
		`https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}`,
		{
			attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
			maxZoom: 18,
			id: 'mapbox/dark-v9',
			tileSize: 512,
			zoomOffset: -1,
			accessToken: mapBoxToken
		}
	).addTo(mymap)

	loadAndApplyMarkers(mymap)

})

// contacting our server and gettings our latitude and longitude
async function loadAndApplyMarkers($map){

	try {

		// load points from our server (which loads postcodes from EN and geocodes them)
		let {data} = await axios.get('https://localhost:3001/points')

		const $markers = []

		data.forEach(point => {

			const $marker = L.marker([point.latitude, point.longitude]).addTo($map)
			$marker.bindPopup(point.firstName)

			$markers.push($marker)

		})

		// zoom and position the map so all markers are in view
		const $markerGroup = new L.featureGroup($markers)
		$map.fitBounds($markerGroup.getBounds())

	}


	catch(err){

		alert(`Unable to load croco-data: ${err}`)

	}

}

