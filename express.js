const mercutio = require('./lib');
const jsonwebtoken = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const rumor = require('rumor')('mercutio');

function failWithSimpleMessage(req, res) {
	return res.status(401).send('Insufficient permissions.');
}

function defaultRequestUserResolver(req) {
	return req.cookies.Authorization || req.get('Authorization') || null;
}

mercutio.middleware = function(secret, { resolveRoles = defaultRequestUserResolver, onDemandFail = failWithSimpleMessage } = {}, { header = 'Authorization' } = {}) {
	rumor(`Adding authorization middleware from mercutio (respondo auth depricated), checking the header ${header} with secret ${secret}`);

	return [
		cookieParser(),

		function(req, res, next) {
			req.identity = req.identity || {};
			req.identity.user = null;
			req.identity.authenticated = false;

			const token = resolveRoles(req);

			jsonwebtoken.verify(token, secret, function(err, decoded) {
				if (err) {
					rumor.error(`Suppressed error during decode: ${err}.`);
					return next();
				}

				req.identity.user = decoded;
				req.identity.authenticated = true;
				req.identity.roles = mercutio(req.identity.user.roles);
				req.identity.require = (role) => {
					if (!req.identity.roles.isAny(role)) onDemandFail(req, res, next);
				};

				rumor.debug('Identity added to req:');
				rumor.info({ identity: req.identity });
				return next();
			});
		},
	];
};

module.exports = mercutio;
