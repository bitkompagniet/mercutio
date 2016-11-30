/* eslint-disable no-unused-expressions, quotes */

const chai = require('chai');
const Role = require('../lib/role');

const should = chai.should();

describe('Role', function() {
	it('should be able to construct admin@my/scope', function() {
		should.not.throw(() => new Role('admin@my/scope'));
	});

	it(`admin@some/scope is not admin@some`, function() {
		(new Role('admin@some/scope')).is(new Role('admin@some')).should.not.be.ok;
	});

	it(`admin@some is admin@some/scope`, function() {
		(new Role('admin@some')).is(new Role('admin@some/scope')).should.be.ok;
	});
});
