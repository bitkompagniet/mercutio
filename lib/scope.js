const _ = require('lodash');

function arrayCommonPart(a, b) {
	for (let i = 0; i < a.length; i += 1) {
		if (!b[i] || b[i] !== a[i]) return a.slice(0, i);
	}

	return a.slice();
}

class Scope {

	constructor(notation) {
		if (notation instanceof Scope) {
			this._scope = notation._scope.slice();
		} else if (_.isArray(notation)) {
			this._scope = _.flatten(notation.map(i => i.split('/')));
		} else if (_.isString(notation) && notation.length > 0) {
			this._scope = notation.split('/');
		} else {
			throw new Error('Scope must be a non-empty string or an array.');
		}

		this._scope = this._scope.filter(i => Boolean(i));
	}

	get segments() {
		return this._scope;
	}

	get length() {
		return this._scope.length;
	}

	isSuper() {
		return this._scope.length === 0;
	}

	shared(scope) {
		const r = new Scope(arrayCommonPart(this.segments, scope.segments));
		return r;
	}

	parentOf(scope) {
		return this.shared(scope).length === this.length;
	}

	in(scope) {
		return this.parentOf(scope);
	}

	childOf(scope) {
		return this.shared(scope).length === scope.length;
	}

	toString() {
		return this._scope.length === 0 ? '/' : this._scope.join('/');
	}

}

module.exports = Scope;
