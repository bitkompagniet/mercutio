module.exports = function (plop) {
	plop.setGenerator('test', {
		description: 'Adds a new unit test file',
		prompts: [{
			type: 'input',
			name: 'name',
			message: 'Name of module to test?',
		}],
		actions: [{
			type: 'add',
			path: 'test/{{kebabCase name}}.js',
			templateFile: 'templates/test.js',
		}],
	});
};
