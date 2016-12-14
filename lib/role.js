const _ = require('lodash');
const Scope = require('./scope');

function roleStringEquality(rsa, rsb) {
	return rsa === rsb || rsa === '*' || rsb === '*';
}

class Role {
	constructor(...args) {
		if (args.length === 1) {
			if (args[0] instanceof Role) {
				this._role = args[0]._role;
				this._scope = new Scope(args[0]._scope);
			} else if (_.isString(args[0])) {
				this.parseFromSingleString(args[0]);
			} else if (_.isPlainObject(args[0])) {
				this.parseFromPlainObject(args[0]);
			}
		} else if (args.length === 2) {
			this.parseFromPair(args[0], args[1]);
		}

		if (!this._role || !this._scope || !(this._scope instanceof Scope)) throw new Error('Something went wrong.');
	}

	parseFromSingleString(s) {
		const split = s.split('@');
		if (split.length !== 2) throw new Error('Role as string must be in the form [role]@[scope]');
		const [role, scopestring] = split;
		this.parseRole(role);
		this.parseScope(scopestring);
	}

	parseFromPair(role, scope) {
		this.parseRole(role);
		this.parseScope(scope);
	}

	parseFromPlainObject(o) {
		if (!('role' in o && 'scope' in o)) throw new Error('Plain object must define keys role and scope');
		this._role = o.role;
		this._scope = new Scope(o.scope);
	}

	parseRole(role) {
		this._role = role;
	}

	parseScope(scope) {
		this._scope = new Scope(scope);
	}

	get role() {
		return this._role;
	}

	get scope() {
		return this._scope;
	}

	is(role) {
		return roleStringEquality(this._role, role._role) && this._scope.in(role._scope);
	}

	isSameWithLesserScope(role) {
		return roleStringEquality(this._role, role._role) && this._scope.childOf(role._scope);
	}

	isAny(...roles) {
		return _.flatten(roles).some(role => this.is(role));
	}

	isAll(...roles) {
		return _.flatten(roles).every(role => this.is(role));
	}

	in(scope) {
		return this._scope.in(scope);
	}

	toObject() {
		return { role: this._role, scope: this._scope.toString() };
	}
}

module.exports = Role;
