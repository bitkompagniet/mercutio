const _ = require('lodash');
const jsonwebtoken = require('jsonwebtoken');
const Role = require('./role');
const Scope = require('./scope');

class Roles {
	constructor(...args) {
		this._roles = [];

		if (args[0] instanceof Roles) {
			this._roles = args[0]._roles;
		} else {
			_.flatten(args).forEach(element => this.parseElement(element));
		}
	}

	parseElement(element) {
		if (element instanceof Role) {
			this._roles.push(new Role(element));
		} else {
			const isToken = this.tryParseWebToken(element);

			if (!isToken) {
				const role = new Role(element);
				this._roles.push(role);
			}
		}
	}

	tryParseWebToken(token) {
		const decoded = jsonwebtoken.decode(token);
		if (!decoded) return false;

		if (decoded && decoded.roles && _.isArray(decoded.roles)) {
			decoded.roles.forEach(element => this.parseElement(element));
			return true;
		}

		throw new Error('When given a JsonWebToken, that token must contain an array "roles"');
	}

	get all() {
		return this._roles.slice();
	}

	get length() {
		return this._roles.length;
	}

	whereIn(scope) {
		const asScope = (scope instanceof Scope) ? scope : new Scope(scope);
		return new Roles(this._roles.filter(item => item.in(asScope)));
	}

	whereIs(role) {
		const asRole = (role instanceof Role) ? role : new Role(role);
		return new Roles(this._roles.filter(item => item.is(asRole)));
	}

	whereRoleIs(...roleStrings) {
		const rs = _.flatten(roleStrings);
		return new Roles(this._roles.filter(item => rs.includes(item._role)));
	}

	in(scope) {
		return this.whereIn(scope).length > 0;
	}

	is(role) {
		return this.whereIs(role).length > 0;
	}

	// Any of the roles in the array matches any of the roles queried
	isAny(...roles) {
		return Roles.coerceRoleArray(roles).some(role => this.is(role));
	}

	// The combination of roles matches all of the roles queried
	isAll(...roles) {
		return Roles.coerceRoleArray(roles).every(role => this.is(role));
	}

	toArray() {
		return this._roles.map(role => role.toObject());
	}

	rationalize() {
		const filteredRoles = this._roles.filter((role, roleIndex) =>
			!this._roles.some((otherRole, otherIndex) =>
				role.isSameWithLesserScope(otherRole) || (role.equals(otherRole) && roleIndex !== otherIndex)
			)
		);

		return new Roles(filteredRoles);
	}

	static coerceRoleArray(arr) {
		return (arr[0] instanceof Roles) ? arr[0].toArray() : _.flatten(arr);
	}
}

module.exports = Roles;
