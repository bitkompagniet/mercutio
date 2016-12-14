const Roles = require('./roles');

function mercutio(roles) {
	return new Roles(roles);
}

function getRolesFromAuthorizationHeader(req) {
	return req.get('Authorization');
}

function failWithSimpleMessage(req, res) {
	return res.status(401).send('Mercutio authorization failed.');
}

mercutio.middleware = function({ resolveRoles = getRolesFromAuthorizationHeader, onDemandFail = failWithSimpleMessage } = {}) {
	return function(req, res, next) {
		const roles = new Roles(resolveRoles(req) || []);

		req.identity = req.identity || {};
		req.identity.roles = roles;
		req.identity.is = role => roles.is(role);
		req.identity.isAny = list => roles.isAny(list);
		req.identity.in = scope => roles.in(scope);
		req.identity.demand = (role) => {
			if (!roles.is(role)) onDemandFail(req, res, next);
		};

		return next();
	};
};

module.exports = mercutio;
