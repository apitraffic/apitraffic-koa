const Koa = require('koa');
const Router = require('@koa/router');

const app = new Koa();
const router = new Router();
const port = 4000;

// Require the ApiTraffic KOA library.
const apiTraffic = require('@apitraffic/koa');

// Pulling this in so we can demo an outbound request being logged...
const axios = require('axios');

// Use the ApiTraffic Middleware...
app.use(apiTraffic.middleware());

// use the KOA Router middleware...
app.use(router.routes());

router
  .get('/', (ctx, next) => {
    ctx.body = {message: 'Hello World!'};
  })
  .get('/authors', async (ctx, next) => {
    try{
        // add some tracing information to the request. You can add as many traces as required, think of it like console log.
        apiTraffic.trace("This is a sample trace from the sample ApiTraffic app.");

        // Await the response of the fetch call
        const response = await axios.get('https://thetestrequest.com/authors');
        
        // tag the request. You can add as many tags to a request as required.
        apiTraffic.tag("Account Id", "12345");

        // added a bit more tracing to show what can be done.
        apiTraffic.trace(`${response.data.length} authors were found.`);
        
        // once the call is complete, build the response...
        ctx.body = response.data;

    } catch (error) {
        // Handle any errors that occur during the fetch
        console.error('Error fetching data:', error);
        throw error; // Rethrow the error for further handling if necessary
    }  
  });
  

app.listen(port);
console.log(`Listening on port ${port}`);