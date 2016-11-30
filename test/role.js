const chai = require('chai');
const Role = require('../lib/role');
const should = chai.should();

describe('Role', function() {
	it('should be able to construct admin@my/scope', function() {
		should.not.throw(() => new Role('admin@my/scope'));
	});
});
