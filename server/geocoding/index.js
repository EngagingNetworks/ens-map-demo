require('dotenv').config()
const chalk = require('chalk')
const axios = require('axios')

const utils = require('../utils')

const geocodeKey = process.env.GEOCODING_KEY
const geocodeBaseUrl = 'https://maps.googleapis.com/maps/api/geocode/json'

/**

	Convert postcode and country to lat + long

**/

const geocodeSupporter = async supporter => {

	const url = `${geocodeBaseUrl}?components=postal_code:${encodeURI(supporter.Postcode)}|country:${encodeURI(supporter.Country)}&key=${geocodeKey}`

	const failed = errorMessage => {

		// if we cant geocode, log an error but dont stop processing
		console.log(chalk.red(`Unable to geocode ${supporter.Postcode} ${supporter.Country}: ${errorMessage}`))

	}

	try {

		let res = await axios.get(url)

		if(res.data.status != 'OK'){
			failed(`geocode unsuccessful: ${res.data.status}`)
			return
		}

		if(!res.data.results || !res.data.results[0]){
			failed('Google response format unexpected')
			return
		}

		// get the first result
		const result = res.data.results[0]

		return {
			key: utils.genKeyForSupporter(supporter),
			firstName: supporter['First Name'],
			latitude: result.geometry.location.lat,
			longitude: result.geometry.location.lng
		}

	}

	catch(err){

		failed(err)

	}

}



module.exports = {
	geocodeSupporter
}
