
const utilities = require('@apitraffic/utilities');
const package = require('./package.json');

/**
 * ApiTraffic Express middleware function.
 * @param {{interceptOutbound?:boolean}} options - Configuration options.
 * @returns {Function} - apitraffic-express middleware.
 */
function apiTraffic(options = {}){
  
    // Set things up...
    utilities.setup(options, utilities.context);
  
    return async function apiTrafficMiddleware(ctx, next){
        
        // make sure the request context is setup with the RequestManager so it can be uses anywhere in the request...
        utilities.context.enterWith({ 
            RequestManager: new utilities.RequestManager({package : {name: package.name, version : package.version}})
        });

        // Go ahead and call the next function so KOA will continue processing...
        await next();
           
        try{
            const apiTrafficOptions = {
                version: utilities.context.getStore().RequestManager.package.version,
                sdk: utilities.context.getStore().RequestManager.package.name                 
            };
            
            let body = null;

            if(ctx.method.toUpperCase() !== 'GET' && ctx.method.toUpperCase() !== 'OPTIONS'){
                body = JSON.stringify(ctx.request.body);
            }


            // TODO: Account for other body types other than JSON...
            const apiTrafficPayload = {
                contextSid : utilities.context.getStore().RequestManager.contextSid,
                direction : "in",
                request: {
                    received: utilities.context.getStore().RequestManager.requestReceivedAt,
                    ip : ctx.ip,
                    url : ctx.href,
                    method: ctx.method.toUpperCase(),
                    headers : ctx.headers,
                    body : body
                },
                response : {
                    headers : ctx.response.headers, 
                    status : ctx.status,
                    responseTime : utilities.getDuration(utilities.context.getStore().RequestManager.requestStartTime),
                    body : ctx.response.body
                },
                tags : utilities.context.getStore().RequestManager.getTagArray(),
                traces : utilities.context.getStore().RequestManager.getTraces()
            };
            
            // call the function to log all now...
            // we will not await the response b/c we want to fire and forget...
            utilities.sendToApiTraffic(apiTrafficOptions, apiTrafficPayload);
            
        }catch(e){
            console.log(e);
        }
        
  };

}
module.exports.middleware = apiTraffic;

module.exports.getContext = function(){
    return utilities.context.getStore();
  }
  
module.exports.getRequestManager = function(){
    return utilities.context.getStore().RequestManager;
}

module.exports.tag = function(key, value){
    utilities.context.getStore().RequestManager.tag(key, value);
  }
  
module.exports.trace = function(content){
    utilities.context.getStore().RequestManager.trace(content);
}