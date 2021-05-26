// loading up .env variables
require('dotenv').config() // use configuration from our .env file

const fs = require('fs') // filesystem
const https = require('https') // for an HTTPS enabled server
const express = require('express') // webserver
const cors = require('cors') // allow browser to make calls to the webserver
const chalk = require('chalk') // snazzy console output
const schedule = require('node-schedule') // refresh our data from ENS every 45 mins
const db = require('./db/index.js') // mongo DB helpers
const ens = require('./ens/index.js') // ENS REST helpers

const port = process.env.SERVERPORT
const sslKey = process.env.SSL_KEY_FILE
const sslCert = process.env.SSL_CERT_FILE

const allowedDomains = (process.env.DOMAINS || '').split(',')


const init = async () => {

	// starting the server

	try {

		const connection = await db.connect() // set up connection to mongo DB

		const loadSupporters = async () => {

			console.log(chalk.yellow(`Loading supporters`))

			// load postcodes, countries and firstnames
			let { data } = await ens.getSupporters()

			// write to DB (includes geocoding)
			await db.addSupporters(data)

		}

		// get our initial load of data
		await loadSupporters()

		// load again once per 45 mins - catch when profile has updated
		const job = schedule.scheduleJob('*/45 * * * *', loadSupporters)

		// create a server
		const server = express()

		// allow cross-origin access
		server.use(cors({
			origin: (origin, cb) => {

				if(!origin){
					// null origin means localhost
					cb(null, true)
					return
				}

				// remove http and port so we can just check the domain
				let trimmed = origin.replace(/https?:\/\//, '').replace(/:\d+$/, '')

				// otherwise check the origin is allowed
				if(allowedDomains.includes(trimmed)){
					cb(null, true)
				}else{
					console.log(chalk.red(`Domain ${origin}, ${trimmed}`))
					cb('Domain not allowed', false)
				}

			}
		}))

		// just one route to return our point data for our browser
		server.get('/points', async (req, res) => {

			try {

				let points = await db.listPoints() // get a list of the points we have already geocoded
				res.send(points)

			}

			catch(err){

				res.statusCode = 500
				res.send(`Unable to load points: ${err}`)

			}

		})


		// apply SSL and start server
		const key = fs.readFileSync(`${__dirname}/${sslKey}`);
		const cert = fs.readFileSync(`${__dirname}/${sslCert}`);

		const httpsServer = https.createServer({key, cert}, server)

		// launch
		httpsServer.listen(port, () => {

			console.log(chalk.green(`Server started on port ${port}`))

		})

	}

	catch(err){

		console.log(chalk.red(`Unable to initiate server: ${err}`))

	}

}


init()
