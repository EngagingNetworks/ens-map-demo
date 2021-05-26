const chalk = require('chalk')
const db = require('./db/index.js')

const clear = async () => {

	console.log(chalk.yellow('Clearing database'))

	try {
		
		await db.clear()
		console.log(chalk.green('Database cleared'))

	}

	catch (err){

		console.log(chalk.red(`Unable to clear database: ${err}`))

	}

	finally {

		process.exit()
		
	}


}

clear()