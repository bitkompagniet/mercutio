const Roles = require('./roles');

function mercutio(roles) {
	return new Roles(roles);
}

mercutio.demand = function(role) {
	return function(req, res, next) {
		req.identity.demand(role);
		return next();
	};
};

module.exports = mercutio;
