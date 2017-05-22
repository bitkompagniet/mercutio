const util = require('util');

function UnauthenticatedError() {
	Error.captureStackTrace(this, UnauthenticatedError);
	this.name = UnauthenticatedError.name;
	this.message = `Role was required, but user was not logged in.`;
}

util.inherits(UnauthenticatedError, Error);

function InsufficientPermissionsError(role) {
	Error.captureStackTrace(this, InsufficientPermissionsError);
	this.name = InsufficientPermissionsError.name;
	this.message = `Insufficient permissions. ${role} was required.`;
}

util.inherits(InsufficientPermissionsError, Error);

exports.InsufficientPermissionsError = InsufficientPermissionsError;
exports.UnauthenticatedError = UnauthenticatedError;
