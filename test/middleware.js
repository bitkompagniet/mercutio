/* eslint-disable no-unused-expressions */

const chai = require('chai');
const lib = require('../express');

const should = chai.should();
const auth = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJhYmNkZWYwMTIzNDU2Nzg5YWJjZGVmMDEiLCJlbWFpbCI6InRlc3RAbXVncy5pbmZvIiwiZmlyc3RuYW1lIjoiVGVzdCIsImxhc3RuYW1lIjoiVGVzdHNlbiIsInJvbGVzIjpbeyJyb2xlIjoiYWRtaW4iLCJzY29wZSI6InVzZXJzL2FiY2RlZjAxMjM0NTY3ODlhYmNkZWYwMSJ9LHsicm9sZSI6Im1lbWJlciIsInNjb3BlIjoidXNlcnMvYWJjZGVmMDEyMzQ1Njc4OWFiY2RlZjAxIn1dLCJleHAiOjMwNjczNDcyMDI3OTEsImlhdCI6MTQ4OTUxMDQwMn0.7r6yAMFe0ikHFiMKFtchxjFy6pTU1sC41fZDOWqBQXw';


function injectReqObjectIntoMercutio(headerAuth, cookieAuth, onComplete, secret = 'ssh') {
	const mercutio = lib.identity(secret)[1];

	const req = {
		header: () => headerAuth,
		cookies: {
			Authorization: cookieAuth,
		},
		get: () => headerAuth,
	};

	mercutio(req, {}, onComplete);
	return req;
}

describe('.identity', function() {
	it('should append correct mercutio middleware methods', function(done) {
		const req = injectReqObjectIntoMercutio(auth, auth, function() {
			should.exist(req.identity);
			req.identity.roles.is.should.be.a('function');
			req.identity.roles.isAny.should.be.a('function');
			req.identity.roles.in.should.be.a('function');
			done();
		});
	});

	it('should allow access when given the correct scopes for test@mugs.info', function(done) {
		const req = injectReqObjectIntoMercutio(auth, auth, function() {
			req.identity.authenticated.should.be.equal(true);
			req.identity.roles.is('admin@users/abcdef0123456789abcdef01').should.be.equal(true);
			req.identity.roles.is('member@users/abcdef0123456789abcdef01').should.be.equal(true);
			req.identity.roles.is('member@users/someotheruser').should.not.be.ok;
			done();
		});
	});

	it('should work with only cookie authentication', function(done) {
		const req = injectReqObjectIntoMercutio(null, auth, function() {
			req.identity.authenticated.should.be.equal(true);
			done();
		});
	});

	it('should work with only cookie authentication', function(done) {
		const req = injectReqObjectIntoMercutio(auth, null, function() {
			req.identity.authenticated.should.be.equal(true);
			done();
		});
	});
	it('should continue without errors if no authorization header or cookie is set', function(done) {
		const req = injectReqObjectIntoMercutio(null, null, function() {
			req.identity.authenticated.should.be.equal(false);
			req.identity.should.be.a('object');
			done();
		});
	});

	it('should not work with wrong secret', function(done) {
		const wrongSecret = 'Quiet down please';
		const req = injectReqObjectIntoMercutio(auth, null, function() {
			req.identity.authenticated.should.be.equal(false);
			done();
		}, wrongSecret);
	});
});

describe('.require', function() {
	it('should throw an InsufficientPermissionsError when role is wrong', function(done) {
		const req = injectReqObjectIntoMercutio(auth, null, function() {
			const requireWare = lib.require('member@users/someotheruser');
			requireWare(req, null, function(err) {
				should.exist(err);
				err.name.should.equal('InsufficientPermissionsError');
				done();
			});
		});
	});

	it('should continue with no effects when role is right', function(done) {
		const req = injectReqObjectIntoMercutio(auth, null, function() {
			const requireWare = lib.require('member@users/abcdef0123456789abcdef01');
			requireWare(req, null, function(err) {
				should.not.exist(err);
				done();
			});
		});
	});
});
