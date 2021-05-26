require('dotenv').config()
const chalk = require('chalk')

const geocoding = require('../geocoding/index.js') // google geocoding helpers

const utils = require('../utils') // need to be able to generate unique keys in the database

const mongoose = require('mongoose') // interface with mongo DB service
let mongoPort = process.env.MONGOPORT
const dbName = process.env.MONGODBNAME

// define data structure
const Schema = mongoose.Schema

const PointSchema = new Schema({
	recordId: Schema.ObjectId,
	key: String,
	firstName: String,
	longitude: String,
	latitude: String
})

const PointModel = mongoose.model('Point', PointSchema)
let retryCount = 0

// starting the DB
const connect = async () => {


	try{ 

		const connection = await mongoose.connect(`mongodb://mongo:${mongoPort}/${dbName}`, {
		  useNewUrlParser: true,
		  useUnifiedTopology: true,
		  useFindAndModify: false,
		  useCreateIndex: true,
		  bufferMaxEntries: 0
		})

		console.log(chalk.green('Connected to mongodb'))

		return connection

	}

	catch(err){

		if(retryCount > 30){
			throw new Error('Unable to connect to mongodb after multiple retries.')
		}

		console.log(chalk.red('Unable to connect to mongodb. Retrying'))
		retryCount++
		await new Promise(resolve => setTimeout(resolve, 5000))
		await connect()

	}

}





// db methods

/**
*	Supporter object from EN:
*	{
*		"First Name": "Test",
*		"supporterId": 999,
*		"Country": "GB",
*		"Postcode": "12345",
*		"createdOn": "2021-05-11"
*	}
*
**/


const addSupporters = (supporters = []) => {

	return Promise.all(
		supporters.map(supporter => addSupporter(supporter))
	)

}

const addSupporter = async supporter => {

	const exists = await findPointByKey(utils.genKeyForSupporter(supporter))

	if(exists.length){
		// no operation required. already in the DB
		return
	}

	// geocode our new supporter data
	const geocoded = await geocoding.geocodeSupporter(supporter)

	if(geocoded){
		// write it to the database
		await addPoint(geocoded)
	}


}

const addPoint = async ({key, firstName, longitude, latitude}) => {

	if(!longitude || !latitude){
		throw new Error('Unable to add point: missing long or lat')
	}

	const newPoint = new PointModel({
		key,
		firstName,
		longitude,
		latitude
	})

	await newPoint.save()

}

const findPointByKey = async key => {

	let found = await PointModel.find({key})
	return found || false

}

const listPoints = async () => {

	let points = await PointModel.find({})

	return points.map(point => {

		return {
			latitude: point.latitude,
			longitude: point.longitude,
			firstName: point.firstName
		}

	})

}

// emptying db out

const clear = async () => {

	await connect()
	await PointModel.deleteMany({})

}

module.exports = {
	connect,
	listPoints,
	addSupporters,
	clear
}