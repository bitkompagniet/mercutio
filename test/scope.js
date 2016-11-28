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

	const p = '123/orgs/986';
	const c1 = '123/orgs/986/child';
	const c2 = '123/orgs/986/groups/765/nuance/45';
	const c3 = '123/teams/12';

	it(`Should return 3 segments for 123/orgs/986`, function() {
		const scope = new Scope('123/orgs/986');
		scope.segments.should.have.length(3);
	});

	it(`should return 123 for commonRoot between ${p} and ${c3}`, function() {
		const a = new Scope(p);
		const b = new Scope(c3);
		a.commonRoot(b).should.equal('123');
	});
});
