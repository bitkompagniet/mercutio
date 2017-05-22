const Roles = require('./roles');

function mercutio(roles) {
	return new Roles(roles);
}

module.exports = mercutio;
