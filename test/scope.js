/* eslint-disable no-unused-expressions, quotes */

const chai = require('chai');
const Scope = require('../lib/scope');

const should = chai.should();

describe('Scope', function() {
	it('should fail if we try to create with falsy or wrong type', function() {
		should.throw(() => new Scope());
		should.throw(() => new Scope(123));
		should.throw(() => new Scope(null));
		should.throw(() => new Scope(undefined));
		should.throw(() => new Scope(''));
	});

	it('should not throw for string or array of strings', function() {
		should.not.throw(() => new Scope('123/test'));
		should.not.throw(() => new Scope(['123', 'test']));
	});

	it('should correctly construct ["123", "test"]', function() {
		const scope = new Scope(['123', 'test']);
		scope.toString().should.equal('123/test');
	});

	const p = new Scope('123/orgs/986');
	const c1 = new Scope('123/orgs/986/child');
	const c2 = new Scope('123/orgs/986/groups/765/nuance/45');
	const c3 = new Scope('123/teams/12');

	it(`Should return 3 segments for ${p}`, function() {
		p.segments.should.have.length(3);
	});

	it(`should return 123 as shared between ${p} and ${c3}`, function() {
		p.shared(c3).toString().should.equal('123');
	});

	it(`should not accept ${c1} as parent of ${p}`, function() {
		c1.parentOf(p).should.not.be.ok;
	});

	it(`should accept ${p} as parent of ${c1}`, function() {
		p.parentOf(c1).should.be.ok;
	});

	it('should not accept my/other/scope as a child of my/scope', function() {
		(new Scope('my/other/scope')).childOf(new Scope('my/scope')).should.not.be.ok;
	});

	it('should not accept some/other as in some/other/scope', function() {
		(new Scope('some/other').in(new Scope('some/other/scope'))).should.not.be.ok;
	});

	it(`should not accept ${p} as child of ${c1}`, function() {
		p.childOf(c1).should.not.be.ok;
	});

	it(`should accept ${c1} as child of ${p}`, function() {
		c1.childOf(p).should.be.ok;
	});

	it(`.in is synonymous with childOf`, function() {
		c1.childOf(p).should.be.ok;
	});

	it('the root scope should be parent of everything', function() {
		const root = new Scope('/');
		root.toString().should.equal('/');
		root.parentOf(p).should.be.ok;
		root.parentOf(c1).should.be.ok;
		root.parentOf(c2).should.be.ok;
		root.parentOf(c3).should.be.ok;
	});
});
