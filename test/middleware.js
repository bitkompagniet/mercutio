const chai = require('chai');
const lib = require('../lib');

const should = chai.should();
const auth = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJhYmNkZWYwMTIzNDU2Nzg5YWJjZGVmMDEiLCJlbWFpbCI6InRlc3RAbXVncy5pbmZvIiwiZmlyc3RuYW1lIjoiVGVzdCIsImxhc3RuYW1lIjoiVGVzdHNlbiIsInJvbGVzIjpbeyJyb2xlIjoiYWRtaW4iLCJzY29wZSI6InVzZXJzL2FiY2RlZjAxMjM0NTY3ODlhYmNkZWYwMSJ9LHsicm9sZSI6Im1lbWJlciIsInNjb3BlIjoidXNlcnMvYWJjZGVmMDEyMzQ1Njc4OWFiY2RlZjAxIn1dLCJleHAiOjMwNjczNDcyMDI3OTEsImlhdCI6MTQ4OTUxMDQwMn0.7r6yAMFe0ikHFiMKFtchxjFy6pTU1sC41fZDOWqBQXw';


function injectReqObjectIntoMercutio(headerAuth, cookieAuth, onComplete, secret = 'ssh') {
	const mercutio = lib.middleware(secret)[1];

	const req = {
		header: () => headerAuth,
		cookies: {
			Authentication: cookieAuth,
		},
		get: () => headerAuth,
	};

	mercutio(req, {}, onComplete);
	return req;
}

describe('Middleware', function() {
	it('should append correct mercutio middleware methods', function(done) {
		const req = injectReqObjectIntoMercutio(auth, auth, function() {
			should.exist(req.identity);
			req.identity.is.should.be.a('function');
			req.identity.isAny.should.be.a('function');
			req.identity.in.should.be.a('function');
			req.identity.demand.should.be.a('function');
			done();
		});
	});

	it('should allow access when given the correct scopes for test@mugs.info', function(done) {
		const req = injectReqObjectIntoMercutio(auth, auth, function() {
			req.identity.authenticated.should.be.equal(true);
			req.identity.is('admin@users/abcdef0123456789abcdef01').should.be.equal(true);
			req.identity.is('member@users/abcdef0123456789abcdef01').should.be.equal(true);
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
	it('should not work without authentication', function(done) {
		const req = injectReqObjectIntoMercutio(null, null, function() {
			req.identity.authenticated.should.be.equal(false);
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
