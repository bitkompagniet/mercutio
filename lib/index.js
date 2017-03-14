const Roles = require('./roles');
const rumor = require('rumor')('mercutio');
const jsonwebtoken = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

function mercutio(roles) {
	return new Roles(roles);
}

function getAuthorizationHeader(req) {
	return req.get('Authorization');
}

function failWithSimpleMessage(req, res) {
	return res.status(401).send('Mercutio authorization failed.');
}

mercutio.middleware = function(secret, { resolveRoles = getAuthorizationHeader, onDemandFail = failWithSimpleMessage } = {}, { header = 'Authorization' } = {}) {
	rumor(`Adding authorization middleware from mercutio (respondo auth depricated), checking the header ${header} with secret ${secret}`);
	return [cookieParser(), function(req, res, next) {
		const roles = new Roles(resolveRoles(req) || []);
		req.identity = req.identity || {};
		req.identity.roles = roles;
		req.identity.is = role => roles.is(role);
		req.identity.isAny = list => roles.isAny(list);
		req.identity.in = scope => roles.in(scope);
		req.identity.demand = (role) => {
			if (!roles.isAny(role)) onDemandFail(req, res, next);
		};
		req.identity.user = null;
		req.identity.authenticated = false;
		const token = req.cookies.Authentication || req.header(header);
		if (!token) rumor.debug('No Authorization header set.');

		jsonwebtoken.verify(token, secret, function(err, decoded) {
			if (err) {
				rumor.error(`Suppressed error during decode: ${err}.`);
				console.log(err);
				return next();
			}
			req.identity.user = decoded;
			req.identity.authenticated = true;
			rumor.debug('Identity added to req:');
			rumor.info({ identity: req.identity });
			return next();
		});
		return;
	}];
};

mercutio.demand = function(role) {
	return function(req, res, next) {
		req.identity.demand(role);
		return next();
	};
};



module.exports = mercutio;
