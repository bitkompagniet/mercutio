/* eslint-disable no-unused-expressions, quotes, no-unused-vars */

const chai = require('chai');
const Roles = require('../lib/roles');
const Role = require('../lib/role');

const should = chai.should();

const tokenRoles = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlBhcmtvdiBEb2UiLCJhZG1pbiI6dHJ1ZSwicm9sZXMiOlsiYWRtaW5AbXkvc2NvcGUiLHsicm9sZSI6Im1lbWJlciIsInNjb3BlIjoibXkvb3RoZXIvc2NvcGUifV19.o935F74yV4ppOoKUsE7Th6R-Wkrou6zRMV-Pu3k-H10';
const testRoles = [
	{ role: 'admin', scope: 'some/scope' },
	{ role: 'editor', scope: 'some/other/scope' },
	'member@new/scope',
];

describe('Roles', function() {
	it('should be able to decode a jsonwebtoken', function() {
		const roles = new Roles(tokenRoles);
		roles.all.should.be.an('array');
		roles.all.should.have.length(2);
		roles.all.forEach((role) => {
			role.should.be.instanceof(Role);
		});

		roles.whereIn('my/scope/below').all.should.have.length(1);
		roles.whereIs('admin@my/scope').should.have.length(1);
		roles.whereIn('my/scope').should.have.length(1);
		roles.is('admin@my/scope').should.be.ok;
	});

	it('should be able to parse an array', function() {
		const roles = new Roles(testRoles);
		roles.all.should.be.an('array');
		roles.all.should.have.length(3);
		roles.whereIn('some/scope/below/this').should.have.length(1);
		roles.whereIn('some/other/scope/down/here').should.have.length(1);
		roles.whereIs('editor@some/other/scope/to/be/examined').should.have.length(1);
		roles.whereIs('editor@some').should.have.length(0);
		roles.in('some').should.not.be.ok;
	});

	it('should be able to rationalize roles', function() {
		const definitions = [
			'admin@some',
			'admin@some/other/scope',
			'admin@users',
			'member@sites',
			'member@sites/27',
		];

		const roles = new Roles(definitions);
		roles.should.have.length(5);

		const rationalized = roles.rationalize();
		rationalized.should.have.length(3);
		rationalized.toArray().map(r => r.scope).should.eql([
			'some',
			'users',
			'sites',
		]);
	});

	it('should remove duplicates upon rationalization', function() {
		const definitions = [
			'admin@some/other/scope',
			'admin@some/other/scope',
			'member@sites',
			'member@sites/27',
			'member@sites/27',
		];

		const roles = new Roles(definitions);
		roles.should.have.length(5);

		const rationalized = roles.rationalize();
		rationalized.should.have.length(2);
		rationalized.toArray().map(r => r.scope).should.eql([
			'some/other/scope',
			'sites',
		]);
	});

	it('should not fail when rationalizing pairs of the same', function() {
		const definitions = [
			'admin@users/27',
			'admin@users/27',
			'member@users/27',
			'member@users/27',
		];

		const roles = new Roles(definitions);
		roles.should.have.length(4);
		roles.toArray().should.have.length(4);
		roles.rationalize().should.have.length(2);
		roles.rationalize().toArray().should.have.length(2);
	});

	it('should be able to decipher an *@/ in the midst', function() {
		const roles = [
			{ role: 'admin', scope: 'users/587e7a19d53d24af3cc5f014' },
			{ role: '*', scope: '/' },
			{ role: 'member', scope: 'users/587e7a19d53d24af3cc5f014' },
		];

		should.not.throw(() => new Roles(roles));
	});

	describe('.whereRoleIs', function() {
		it('should include roles with a * role', function() {
			const roles = [
				{ role: 'admin', scope: 'users/587e7a19d53d24af3cc5f014' },
				{ role: '*', scope: '/' },
				{ role: 'member', scope: 'users/587e7a19d53d24af3cc5f014' },
			];

			(new Roles(roles)).whereRoleIs('member').should.have.length(2);
		});
	});
});
