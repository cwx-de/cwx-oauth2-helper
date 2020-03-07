const cfg = require('config');
console.log(`Using configurations from ${cfg.util.getEnv('NODE_CONFIG_DIR')}`);

const express = require('express');
const app = express();
const port = cfg.has('server.port') ? cfg.get('server.port') : 3000;

const request = require('request');
const open = require('open');
const crypto = require('crypto');
const HashMap = require('hashmap');

const callbackUrl = `http://127.0.0.1:${port}/oauth2/callback`;

// this is only good for a single user local app!
const flowState = new HashMap();
var tokenPageState;

// set up endpoints
app.get('/', (req, res) => {
	flowState.clear();
	let show = '<p>Retrieve tokens from:</p>';
	show += '<ul>';
	cfg.get('environments').forEach( (env) => {
		let state = crypto.randomBytes(20).toString('hex');
		flowState.set(state, env.id);
		
		url = new URL(env.authorizationUrl);
		url.searchParams.append('response_type', 'code');
		url.searchParams.append('client_id', env.clientId);
		url.searchParams.append('redirect_uri', callbackUrl);
		url.searchParams.append('state', state);
		show += `<li><a href="${url.href}">${env.name}</a></li>`;
	});
	show += '</ul>';
	res.send(show);
});

app.get('/tokens', (req, res) => {
	res.send(formatTokens(tokenPageState.header, tokenPageState.err, tokenPageState.tokens));
});

app.get('/oauth2/callback', (req, res) => {
	console.log(`Got callback with query ${JSON.stringify(req.query)}`);

	let envs = cfg.get('environments');
	let env;
	for(i = 0; i < envs.length; i++) {
		if(envs[i].id === flowState.get(req.query.state)) {
			env = envs[i];
			break;
		}
	}

	flowState.delete(req.query.state);
	
	getTokens(env, req.query.code, (name, err, tokens) => {
		tokenPageState = {
			header: name,
			err: err,
			tokens: tokens
		}
		res.redirect('/tokens');
	});
});

// start web server
app.listen(port, () => console.log(`CWX app listening on port ${port}!`));

// open a browser and go to home
(async () => {
    await open(`http://127.0.0.1:${port}`);
})();

function getTokens(env, code, cb) {
	let params = {
		client_id: env.clientId,
		client_secret: env.clientSecret,
		grant_type: 'authorization_code',
		redirect_uri: callbackUrl,
		code: code
	};
	
	request.post({ 
		uri: env.tokenUrl,
		form : params,
	}, (e, r, body) => {
		let error = null;
		let tokens = null;
		if(e) {
			console.log(e.message);
			error = e;
		} else if (r.statusCode != 200) {
			console.log(`Token endpoint says: ${r.statusCode} ${r.statusMessage}`);
			console.log(r.body);
			error = { message: `Token endpoint says: ${r.statusCode} ${r.statusMessage}<br>${r.body}` };
		} else {
			let b = JSON.parse(body);
			console.log('tokens received:');
			console.log(`access_token=${b.access_token}`);
			console.log(`refresh_token=${b.refresh_token}`);
			tokens = b;
		}
		cb(env.name, error, tokens);
	});	
};

function formatTokens(header, err, tokens) {
	let show = '<head>	\
		<style>	\
		table {border-collapse:collapse; table-layout:fixed; width:75%;}		\
		table td {border:solid 1px #fab; width:100px; word-wrap:break-word;}	\
		</style>	\
		</head>		\
		<body>';
	show += `<h1>${header}</h1>`;
	show += '<a href="/">Back</a><br><br>';
	if(err) {
		show += err.message;
	} else {
		show += '<table style="width:75%"><tbody>'
			+ '<tr><td><p>access_token:</p></td></tr>'
			+ `<tr><td><p style="font-family:monospace">${tokens.access_token}</p></td></tr>`
			+ '<tr><td><p>refresh_token:</p></td></tr>'
			+ `<tr><td><p style="font-family:monospace">${tokens.refresh_token}</p></td></tr>`
			+ '</tbody></table>';
	}
	show += '<br><a href="/">Back</a>	\
		</body></html>';
	return show;
};