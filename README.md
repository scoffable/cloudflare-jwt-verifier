# cloudflare-jwt-verifier
Cloudflare worker that verifies incoming requests have a valid JSON Web Token (JWT) before the request is forwarded on to your infrastructure

This use case is in conunction with the [Approov](https://approov.io) service, although it could be modified to verify any JWT.

## Why?

There are a couple of reasons for wanting to do this:
 1. Prevent abuse of your unauthenticated APIs (scraping, malicious activity etc)
 2. DDoS prevention

The Approov service attests that a device is running a legitimate version of your mobile application and hasn't been tampered with:
 1. If the application looks ok, Approov return a token to your mobile application which is then sent over with any request, is validated server side, and the request is processed
 2. If the application doesn't look ok, Approov return a legitimate looking token that will fail the server side validation, and the request won't be processed

This means that only your mobile app can talk to your mobile API.

## Setup

Before you begin, you need to install the [Serverless Framework](https://serverless.com/framework/docs/providers/aws/guide/installation/).

## Configuration and Deployment


In `serverless.yml`:
 1. Insert your Cloudflare Account ID and Zone ID in the `provider.config` section
 1. Add the URL pattern you want to secure in the `functions.jwt-verifier.events.http` section

Get Approov Secret from approov admin console

In `jwt-verifier.js`:
 1. Replace 'SECRET HERE' with your Base64 Encoded Approov Secret (although this could work with any JWT secret). _Note to self ... use Cloudflare KV Store to hold this in future ... it didn't work at the time of writing hence this_

Add environment variables:
 1. `export ACCOUNT_ID=CLOUDFLARE_ACCOUNT_ID`
 2. `export CLOUDFLARE_AUTH_EMAIL=EMAIL_ADDRESS_YOU_USE_TO_LOG_INTO_CLOUDFLARE`
 3. `export CLOUDFLARE_AUTH_KEY=<GET FROM CLOUDFLARE CONSOLE>` - Get this "My Profile" -> "Global API Key" in CF Console

Deploy project to Cloudflare
 * `sls deploy`

You should now be able to see the worker in the "Workers" tab of the Cloudflare console.

## Usage

Clients send over Json Web Tokens in a field called *Device-Token* (this can be changed in `jwt-verifier.js`).

The Cloudflare worker ensures the JWT supplied in the Device-Token header is present and valid (using a shared secret).
 * If the JWT is valid, it's passed on using whatever Cloudflare rules you have
 * If the JWT is invalid, a HTTP 403 Forbidden is returned

You can choose to log JWT verification failures, but that typically has to go to another provider as Cloudflare doesn't have worker logging (yet)
