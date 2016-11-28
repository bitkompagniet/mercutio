```javascript
const mercutio = require('mercutio');

mercutio.role('admin@123/organisations/987').canEditRightsFor('');
mercutio.role({ role: 'admin' }).canEditRightsFor('');
mercutio.roles([ ... ]).memberOf(); // true / false
mercutio.roles([ ... ]).memberOf(); // true / false
mercutio.roles([ ... ]).adminOf(); // true / false
mercutio.roles([ ... ]).is('admin', 'myscope'); // true / false

```