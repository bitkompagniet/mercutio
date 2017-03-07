const Roles = require('./roles');
const rumor = require('rumor')('mercutio');
const jsonwebtoken = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

function mercutio(roles) {
	return new Roles(roles);
}

function getRolesFromAuthorizationHeader(req) {
	return req.get('Authorization');
}

function failWithSimpleMessage(req, res) {
	return res.status(401).send('Mercutio authorization failed.');
}

mercutio.middleware = function(secret = 'shh', { resolveRoles = getRolesFromAuthorizationHeader, onDemandFail = failWithSimpleMessage } = {}, { header = 'Authorization' } = {}) {
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
		req.identity = { user: null, authenticated: false };
		let token = req.cookies.Authentication;
		if (!token) { // header as a fallback
			token = req.header(header);
		}
		if (!token) {
			rumor.debug('No Authorization header set.');
			return next();
		}
		jsonwebtoken.verify(token, secret, function(err, decoded) {
			if (err) {
				rumor.error(`Suppressed error during decode: ${err}.`);
				return next();
			}
			req.identity.user = decoded;
			req.identity.authenticated = true;
			rumor.debug('Identity added to req:');
			rumor.debug(req.identity);
			return next();
		});
	}];
};

mercutio.demand = function(role) {
	return function(req, res, next) {
		req.identity.demand(role);
		return next();
	};
};



module.exports = mercutio;
