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

	it(`admin@users is all of ['admin@users/27', 'admin@users/36']`, function() {
		(new Role('admin@users'))
			.isAll([
				new Role('admin@users/27'),
				new Role('admin@users/36'),
			]).should.be.ok;
	});

	it(`admin@sites is any of ['admin@sites/67', 'admin@users/36']`, function() {
		(new Role('admin@sites'))
			.isAny([
				new Role('admin@sites/67'),
				new Role('admin@users/36'),
			]).should.be.ok;
	});

	it(`admin@sites is not all of ['admin@sites/67', 'admin@users/36']`, function() {
		(new Role('admin@sites'))
			.isAll(
				new Role('admin@sites/67'),
				new Role('admin@users/36')
			).should.not.be.ok;
	});

	it('*@sites is member@sites/27', function() {
		(new Role('*@sites')).is(new Role('member@sites/27')).should.be.ok;
	});

	it('viewer@sites/27 is *@sites/27', function() {
		(new Role('viewer@sites/27')).is(new Role('*@sites/27')).should.be.ok;
	});

	it('*@sites is not member@users', function() {
		(new Role('*@sites')).is(new Role('member@users')).should.not.be.ok;
	});
});
