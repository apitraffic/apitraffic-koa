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
app.use(apiTraffic());

// use the KOA Router middleware...
app.use(router.routes());

router
  .get('/', (ctx, next) => {
    ctx.body = 'Hello World!';
  })
  .get('/outbound', async (ctx, next) => {
    try{
        // Await the response of the fetch call
        const response = await axios.get('https://official-joke-api.appspot.com/random_joke')
        
        // once the call is complete, build the response...
        ctx.body = 'Hello World w/ outbound request!';

    } catch (error) {
        // Handle any errors that occur during the fetch
        console.error('Error fetching data:', error);
        throw error; // Rethrow the error for further handling if necessary
    }  
  });
  

app.listen(port);
console.log(`Listening on port ${port}`);