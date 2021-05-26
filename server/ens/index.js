const https = require('https')
const axios = require('axios')

const privateToken = process.env.PRIVATE_TOKEN
const domain = process.env.ENS_DOMAIN
const profileId = process.env.PROFILE_ID
const exportGroup = process.env.EXPORT_GROUP
const chalk = require('chalk')


/**

	Authentication

**/

const authenticateToENS = async () => {

	console.log(chalk.yellow('Authenticating to ENS'))
	
	try {
		
		let res = await axios({
			method: 'post',
			url: `https://${domain}/ens/service/authenticate`,
			headers: {
				'content-type': 'application/json'
			},
			data: privateToken
		})

		if(res.status !== 200){
			throw new Error(`wrong status code - ${res.status}`)
		}

		if(!res.data || !res.data['ens-auth-token']){
			throw new Error(`unexpected response from EN - ${res.data}`)
		}

		console.log(chalk.green('Authenticated to ENS'))

		return {
			newTemporaryToken: res.data['ens-auth-token'],
			timeToLive: res.data['expires']
		}

	}

	catch(err){

		console.log(err)

	}

}



/**

	Loading supporters (country, postcode and firstname)

**/


const getSupporters = async () => {

	try {

		// get an auth token to make calls to ENS
		let { newTemporaryToken } = await authenticateToENS()


		// call the first 100 (max) results from our profile, using an export group we've already set up
		let res = await axios({
			method: 'get',
			url: `https://${domain}/ens/service/supporter/query?type=profile&daysBack=32&rows=100&profileId=${profileId}&exportGroup=${encodeURIComponent(exportGroup)}`,
			headers: {
				'content-type': 'application/json',
				'ens-auth-token': newTemporaryToken
			},
			data: privateToken
		})

		return res.data

	}

	catch(err){

		throw new Error(`unable to load supporters: ${err}`)

	}

}



module.exports = {
	getSupporters
}
