const mercutio = require('./lib');
const jsonwebtoken = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const rumor = require('rumor')('mercutio');

function failWithSimpleMessage(req, res) {
	return res.status(401).send('Mercutio authorization failed.');
}

function getAuthorizationHeader(req) {
	return req.get('Authorization') ? req.get('Authorization') : '';
}

mercutio.middleware = function(secret, { resolveRoles = getAuthorizationHeader, onDemandFail = failWithSimpleMessage } = {}, { header = 'Authorization' } = {}) {
	rumor(`Adding authorization middleware from mercutio (respondo auth depricated), checking the header ${header} with secret ${secret}`);

	return [
		cookieParser(),

		function(req, res, next) {
			const roles = mercutio(resolveRoles(req) || []);
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

			if (!token) {
				req.identity.user = {};
				req.identity.authenticated = false;
			}

			return jsonwebtoken.verify(token, secret, function(err, decoded) {
				if (err) {
					rumor.error(`Suppressed error during decode: ${err}.`);
					return next();
				}
				req.identity.user = decoded;
				req.identity.authenticated = true;
				rumor.debug('Identity added to req:');
				rumor.info({ identity: req.identity });
				return next();
			});
		},
	];
};

module.exports = mercutio;
