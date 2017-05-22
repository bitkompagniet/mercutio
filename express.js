const mercutio = require('./lib');
const jsonwebtoken = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const rumor = require('rumor')('mercutio');
const errors = require('./lib/errors');
const _ = require('lodash');

mercutio.identity = function(secret, {
	tokenResolver = req => req.cookies.Authorization || req.get('Authorization') || null,
	roleResolver = user => (user && user.roles) || [],
} = {}) {
	return [
		cookieParser(),

		function(req, res, next) {
			req.identity = req.identity || {};
			req.identity.user = null;
			req.identity.authenticated = false;

			const token = tokenResolver(req);

			jsonwebtoken.verify(token, secret, function(err, decoded) {
				if (err) {
					rumor.error(`Suppressed error during decode: ${err}.`);
					return next();
				}

				req.identity.user = decoded;
				req.identity.authenticated = true;
				req.identity.roles = mercutio(roleResolver(req.identity.user));

				rumor.debug('Identity added to req:');
				rumor.info({ identity: req.identity });
				return next();
			});
		},
	];
};

mercutio.require = function(roleResolver) {
	return function(req, res, next) {
		if (!req.identity.authenticated) {
			return next(new errors.UnauthenticatedError());
		}

		const role = _.isFunction(roleResolver) ? roleResolver(req) : roleResolver;

		if (role && !req.identity.roles.is(role)) {
			rumor.debug(`Permission denied for ${req.identity.user.email}. Needed ${role}.`);
			return next(new errors.InsufficientPermissionsError(role));
		}

		return next();
	};
};

module.exports = mercutio;
