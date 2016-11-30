Mercutio is a small module to validate user roles by scopes. It assumes an array of roles that can be described as `[role]@[scope]`, where role is a non-hierarchical user type, and scopes are path-based domains of influence. Being `admin@my/scope` automatically implies that you are also `admin@my/scope/area`, but you have no status in `@my`.

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

## Middleware

Mercutio exposes a middleware function, which will augment the `req.identity` object.

```javascript
const app = require('express')();
const mercutio = require('mercutio');

app.use(mercutio.middleware());

app.use(function(req, res) {

	req.identity.is('admin@my/scope'); // ask if resolved user is admin in my/scope
	req.identity.in('my/scope'); // ask if user is in my/scope in any role
	req.identity.demand('admin@my/scope'); // will call the fail handler if false

});
```

Per default, mercutio will try to retrieve the roles from a JWT token set on the `Authorization` header of the request. This retrieval can be customized:

```javascript
app.use(mercutio.middleware({ resolveRoles: req => /* Do something else to retrieve roles */ }));
```

Please note that mercutio does **not** verify the token. This should be done before trusting the token.

The failure that arises from `demand`ing a role can also be configured:

```javascript
app.use(mercutio.middleware({ onDemandFail: (req, res, next) => /* Do something else on failure */ }));
```

The default behaviour is to set status 401 and return an authorization failure message.