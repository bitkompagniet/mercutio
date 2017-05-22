Mercutio is a small module to validate user roles by scopes. It assumes an array of roles that can be described as `[role]@[scope]`, where role is a non-hierarchical user type, and scopes are path-based domains of influence. Being `admin@my/scope` automatically implies that you are also `admin@my/scope/area`, but you have no status in `@my`.

Roles are not hierarchical. Being `admin` will not return true for any other role, so `admin` does not imply `member`, for instance.

```javascript
const mercutio = require('mercutio');

const user = mercutio('admin@users/987');

user.is('admin@users/987'); // true, this is the main scope
user.is('admin@users/987/orgs/123'); // true, this is a sub-scope
user.in('users/987/myscope'); // true, this is a sub-scope
user.is('admin@users'); // false, this scope is above
user.is('member@users/987'); // false, member is NOT implied from admin
```

Mostly, a user will have several roles. You can also feed it arrays, and objects instead of
strings:

```javascript
let user = mercutio('admin@users/987', 'member@123');
user = mercutio(['admin@users/987', 'member@123']);
user = mercutio({ role: 'admin', scope: 'users/987' }, { role: 'member', scope: 'my/scope' });
```

Finally, it can also take and decode a JSON web token. But the decoded payload should have a `roles` property that is an array conforming to the above.

## Express middleware

Mercutio exposes some middleware functions which can be used in an `express` compatible application. Please note that to use this, you need to require `mercutio/express`, which is an extended version with middleware functions. This version cannot be required on the frontend, as it relies on the `jsonwebtoken` package and verifies the token.

### `.identity` middleware

This will augment the `req` object with a `req.identity` object, which contains

```javascript
const app = require('express')();
const mercutio = require('mercutio/express');

app.use(mercutio.identity());

app.use(function(req, res) {
	// true or false, based on whether a token was found and verified.
	const loggedIn = req.identity.authenticated;
	// ask if resolved user is admin in my/scope
	const isRole = req.identity.roles.is('admin@my/scope');
	// ask if user is in my/scope in any role
	const inScope = req.identity.roles.in('my/scope');
});
```

The `req.identity` object will have these properties:

```javascript
{
	// decoded user object
	user: {},
	// whether a token was verified successfully
	authenticated: bool,
	// an initialized mercutio Roles object, created from roles on user object
	roles: { Mercutio object }
}
```

You can customize how `mercutio` gets the info necessary for constructing the identity. This is the options and their defaults:

```javascript
app.use(mercutio.identity({
	// How to resolve the token
	tokenResolver: req => req.cookies.Authorization || req.get('Authorization') || null,

	// How to resolve the roles from the decoded token
	roleResolver: user => (user && user.roles) || [],
}));
```

### `.require` middleware

This middleware will only work as expected if `.identity` was added earlier in the chain. It can be used to require a specific role as an access requirement to a route.


```javascript
const app = require('express')();
const mercutio = require('mercutio/express');

app.use(mercutio.identity());

// This will pass an `UnauthenticatedError` to next if the user is unauthenticated.
app.get('/admins', mercutio.require(), function(req, res) {});

// This will pass an `UnauthenticatedError` if no user, or an `InsufficientPermissionsError` if wrong role.
app.get('/admins', mercutio.require('admin@scope'), function(req, res) {});

// This will pass an `UnauthenticatedError` if no user, or an `InsufficientPermissionsError` if wrong role.
app.get('/secret-route', mercutio.require(req => `admin@users/${req.params.id}`), function(req, res) {});
```
