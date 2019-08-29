const jwt = require("jsonwebtoken");

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event))
})

async function handleRequest(event) {
  const token = event.request.headers.get('Device-Token');
  let isValid = await isValidJwt(token)

  if (!isValid) {
    var ip = event.request.headers.get('cf-connecting-ip') || '';
    var userAgent = event.request.headers.get('User-Agent') || '';
    var requestMethod = event.request.method || '';
    var requestUrl = event.request.url || '';
    var safeToken = token || '';

    // Log all JWT failures
    log("[" + ip + "] " + requestMethod + " " + requestUrl + " [UA: " + userAgent + "] [JWT: " + safeToken + "]" )

    // Invalid JWT - reject request
    return new Response('Invalid Token', { status: 403 })
  }
  
  const response = await fetch(event.request)
  return response
}

async function isValidJwt(token) {
  const secret = 'SECRET HERE'

  try {
    jwt.verify(token, Buffer.from(secret, 'base64'), { 'ignoreExpiration': false});
    // Token is good!
    return true;
  } catch(err) {
    // If the JWT verification fails, an exception will be thrown and we'll end up in here
    return false
  }

}

function log(content) {
   // If you want to log JWT rejections, add code in here to send the message to your preferred cloud based logging framework 
}
