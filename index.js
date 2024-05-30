
const utilities = require('@apitraffic/utilities');
const package = require('./package.json');

/**
 * ApiTraffic Express middleware function.
 * @param {{interceptOutbound?:boolean}} options - Configuration options.
 * @returns {Function} - apitraffic-express middleware.
 */
function apiTraffic(options = {}){
  
    // Set things up...
    utilities.setup(options);
  
    return async function apiTrafficMiddleware(ctx, next){
        
        const requestReceivedAt = new Date().toISOString();

        // Set the request start time so we can figure out the total request duration...
        const requestStartTime = process.hrtime();

        // Go ahead and call the next function so KOA will continue processing...
        await next();
           
        try{
            const apiTrafficOptions = {
                version: package.version,
                sdk: package.name                    
            };
            
            let body = null;

            if(ctx.method.toUpperCase() !== 'GET' && ctx.method.toUpperCase() !== 'OPTIONS'){
                body = JSON.stringify(ctx.request.body);
            }


            // TODO: Account for other body types other than JSON...
            const apiTrafficPayload = {
                request: {
                    received: requestReceivedAt,
                    ip : ctx.ip,
                    url : ctx.href,
                    method: ctx.method,
                    headers : ctx.headers,
                    body : body
                },
                response : {
                    headers : ctx.response.headers, 
                    status : ctx.status,
                    responseTime : utilities.getDuration(requestStartTime),
                    size: ctx.length,
                    body : ctx.response.body
                }
            };
            
            // call the function to log all now...
            // we will not await the response b/c we want to fire and forget...
            utilities.sendToApiTraffic(apiTrafficOptions, apiTrafficPayload);
            
        }catch(e){
            console.log(e);
        }
        
  };

}
module.exports = apiTraffic;