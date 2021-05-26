/**
*	General utility functions
**/

const genKeyForSupporter = supporter => {

	return `${supporter.Postcode}::${supporter.Country}`

}


module.exports = {
	genKeyForSupporter
}