var dotfile = require('../util/dotfile.js');

module.exports = {
	login: function(cmd) {
		var url = null;
		var apiKey = null;
		if (cmd.serverAlias) {
			var loginInfo = dotfile.getLoginForAlias(cmd.serverAlias);
			if ( ! loginInfo) {
				console.log(('Unknown alias: ' + cmd.serverAlias).red);
				return;
			}
			url = loginInfo.url;
			apiKey = loginInfo.loginInfo.apikey;
		}
		else {
			var loginInfo = dotfile.getCurrentServer();
			url = loginInfo.url;
			apiKey = dotfile.getApiKey(loginInfo.url, loginInfo.userName);
			if ( ! apiKey) {
				console.log('You cannot run this command because you are not currently logged in.'.red);
				return;
			}
		}
		return {url: url, apiKey: apiKey};
	}
};