# ens-map-demo
An example of a map using the ENS REST profile call, Node JS and MongoDB


## server
An example server that fetches supporters from Engaging Networks based on a profile and export group, geocodes the results based on their postcode and country, and sets up a CORS endpoint at /points for browsers to retrieve the first name, longitude and latitude.

**Important note #1:** This is a demonstration server app only and has not been security tested - please follow your own organisation's policies on server security

**Important note #2:** No particular knowledge of data law and data protection informed this demo - again, use your own organisation's policies and relevant data law to inform what supporter data can be processed and shared by the server


### setup


#### requirements
A Docker file and a Docker compose file is have also been provided. These would only require Docker. If you wish to use them, see the `.env` instructions on a flag required to enable this

Otherwise, the example uses Node JS and MongoDB, so those must both be installed. Then run `npm install` in the `/server` directory.


#### configuration
The supplied example of an `.env` file must be populated as follows:

| Property | Description |
| ----------- | ----------- |
| SSL_CERT_FILE | The name of the SSL .crt file (required for HTTPS) |
| SSL_KEY_FILE | The name of the SSL .key file (required for HTTPS) |
| MONGOPORT | The port Mongo DB is running on (default: 3003) |
| MONGODBNAME | The name for the Mongo DB database |
| PRIVATE_TOKEN | Your Engaging Networks private token for ENS REST. Obtained from your EN API user |
| ENS_DOMAIN | The domain to make calls to ENS over. Usually e-activist.com or us.activist.com - whichever you log into the dashboard via |
| SERVERPORT | The port the server will accept HTTPS requests over (default: 3001) |
| PROFILE_ID | The profile ID from Engaging Networks |
| EXPORT_GROUP | The name of the Export Group in Engaging Networks |
| DOMAINS | Comma-separated list of domains to allow HTTPS calls to the server over |
| GEOCODING_KEY | Google geocoding API key |
| USE_DOCKER | If you wish to use docker compose, set to `true` |

If you set USE_DOCKER to `true` **and** have changed either MONGOPORT or SERVERPORT, you will need to adjust the configuration in `docker-compose.yml` and `Dockerfile`.


#### starting the server
If you're using docker, simply `docker compose up`

If not, run `npm run start` for production. Run `npm run startdev` for hot-reloading via nodemon.

Once the server has connected to MongoDB, loaded the points from ENS and geocoded any that are missing from the local database, they will be available at:
https://{server domain}:{SERVERPORT}/points


## browser

We used webpack to compile some browser code using Leaflet JS, Axios and Babel to call the server and display the points on the map. It was based on the server running locally on https://localhost:3001. This has been provided for reference.


