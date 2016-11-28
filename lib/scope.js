const _ = require('lodash');

class Scope {

	constructor(notation) {
		let scopeString;

		if (_.isArray(notation)) {
			scopeString = notation.join('/');
		}

		if (!scopeString || !_.isString(scopeString) || scopeString.length === 0) throw new Error('Scope must be a non-empty string.');
		this._scope = scopeString;
	}

	get segments() {
		return this.segmentize(this._scope);
	}

	get value() {
		return this._scope;
	}

	segmentize(scope) {
		return scope.split('/');
	}

	commonRoot(scope) {
		return _.intersection(this.segments, scope.segments);
	}

	isParentOf(scope) {
		return this.commonRoot(scope).length === this.segments.length;
	}

	isChildOf(scope) {

	}

}

module.exports = Scope;