Simple OAuth2 Authorization Code grant helper for CaseWorx
==========================================================

Introduction
------------

CaseWorx authentication helper provides easy way to obtain access and refresh tokens generated by 
OAuth2 authorization server.  

It can also be used as an example of a desktop application that uses OAuth2 Authorization Code grant flow. 

Quick Start
-----------

Clone into your app directory of choice, update configuration and you are ready to go.

**Pre-requisites**

You will need client ID and client secret registered with your authorization server(s). Your AS must be configured to accept 
callback URL `http://127.0.0.1:3000/oauth2/callback` (you may change port the app is listening on but you need to make sure 
that the port is accepted by your AS).

**Install in your app directory**

```shell
$ cd cwx-oauth2-helper
$ npm install
```

**Edit the default config file**

```shell
$ vi config/default.yaml
```

```yaml
environments:
    -   id: stg
        authorizationUrl: replace_with_your_authorization_endpoint_url
        tokenUrl: replace_with_your_token_endpoint_url
        clientId: replace_with_your_client_ID
        clientSecret: replace_with_your_client_secret
    -   id: prd
        authorizationUrl: replace_with_your_authorization_endpoint_url
        tokenUrl: replace_with_your_token_endpoint_url
        clientId: replace_with_your_client_ID
        clientSecret: replace_with_your_client_secret
```

**Start your app**

```shell
$ node app.js
```

The app will start a webserver listening on your loopback IP address, by default on port 3000. 
Your system browser will open and will take you to the homepage. Select the desired environment
of your authorization server, log in and enjoy the tokens.

Configuration
-------------

**Configuration management**

Out of the box the `./config/default.yaml` is available. Valid client IDs and secrets must be provided.

The app uses [config](https://www.npmjs.com/package/config) package - refer to the documentation if you need 
more flexibility in handling configurations. For example, if you want to change default location of the configuration 
directory, use:

```shell
$ export NODE_CONFIG_DIR='/your/directory/of/choice'
$ node app.js
```

or 

```shell
$ NODE_CONFIG_DIR='/your/directory/of/choice' node app.js
```

**Configuration properties**
- `server.port` the port the app server listens on, default: 3000; remember - it will be used in your callback URL
- `environments` an array of the AS environment configurations you want to work with. Environment properties:
	- `id` unique environment identifier
	- `name` a human-readable environment name
	- `authorizationUrl` OAuth2 authorization url
    - `tokenUrl` OAuth2 token url
    - `clientId` OAuth2 client ID
    - `clientSecret` OAuth2 client secret


