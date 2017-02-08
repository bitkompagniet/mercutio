module.exports = function (rsa, rsb) {
	return rsa === rsb || rsa === '*' || rsb === '*';
};
