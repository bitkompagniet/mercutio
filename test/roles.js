/* eslint-disable no-unused-expressions, quotes */

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

		roles.whereIn('my').all.should.have.length(2);
		roles.whereIs('admin@my/scope').should.have.length(1);
		roles.whereIn('my/scope').should.have.length(1);
		roles.is('admin@my/scope').should.be.ok;
	});

	it('should be able to parse an array', function() {
		const roles = new Roles(testRoles);
		roles.all.should.be.an('array');
		roles.all.should.have.length(3);
		roles.whereIn('some').should.have.length(2);
		roles.whereIn('some/other').should.have.length(1);
		roles.whereIs('editor@some/other/scope/to/be/examined').should.have.length(1);
	});
});
