#!/usr/bin/env node

/**
 * A command-line interface for Espresso Logic
 */

var program = require('commander');
var path = require('path');
var pkg = require( path.join(__dirname, 'package.json') );

var login = require('./commands/login.js');
var get = require('./commands/get.js');
var post = require('./commands/post.js');
var del = require('./commands/delete.js');
var describe = require('./commands/describe.js');
var dotfile = require('./util/dotfile.js');


program
	.version(pkg.version);

program
	.command('login <url>')
	.description('Login to an Espresso Logic server')
	.option('-u, --username <username>', 'Espresso user name under which to log in')
	.option('-p, --password <password>', 'Espresso password')
	.option('-a, --serverAlias <serverAlias>', 'Alias for this connection')
	.action(login.commandLogin);

program
	.command('logout [url]')
	.description('Logout from the current server, or a specific server')
	.option('-a, --serverAlias <serverAlias>', 'Alias from which to logout')
	.action(login.commandLogout);

program
	.command('use <alias>')
	.description('Use the specified server by default')
	.action(login.commandUseAlias);

program
	.command('status')
	.description('Show the current server, and any defined server aliases')
	.action(login.commandStatus);

program
	.command('get <resource>')
	.description('Retrieve some data for the given resource/table/view')
	.option('-k, --pk <pk>', 'Primary key of the table or resource')
	.option('-f, --filter <filter>', 'Optional: filter, e.g. "balance<1000"')
	.option('-s, --sort <sort>', 'Optional: sorting order, e.g. "balance,name desc"')
	.option('-z, --pagesize <pagesize>', 'Optional: up to how many rows to return per level')
	.option('-m, --format <format>', 'Optional: format of output, either text (default), json or compactjson')
	.option('--truncate <length>', 'Optional: truncate values at this many characters (default 20)')
	.option('-a, --serverAlias <serverAlias>', 'Optional: alias of the server to use if other than the current default server')
	.action(get.commandGet);

program
	.command('post <resource>')
	.description('Insert some data')
	.option('-j, --json <json>', 'JSON for the data being inserted')
	.option('-f, --jsonfile <jsonfile>', 'Name of a file containing JSON to be inserted, or stdin to read from stdin')
	.option('-m, --format <format>', 'Optional: format of output, either text (default), json or compactjson')
	.option('-a, --serverAlias <serverAlias>', 'Optional: alias of the server to use if other than the current default server')
	.action(function(resource, cmd) { post.commandPost(resource, cmd, 'post'); });

program
	.command('put <resource>')
	.description('Update some data')
	.option('-k, --pk <pk>', 'Primary key of the table or resource')
	.option('-j, --json <json>', 'JSON string for the data being updated')
	.option('-f, --jsonfile <jsonfile>', 'Name of a file containing JSON to be updated, or stdin to read from stdin')
	.option('-m, --format <format>', 'Optional: format of output, either text (default), json or compactjson')
	.option('-a, --serverAlias <serverAlias>', 'Optional: alias of the server to use if other than the current default server')
	.action(function(resource, cmd) { post.commandPost(resource, cmd, 'put'); });

program
	.command('delete <resource>')
	.description('Delete some data')
	.option('-k, --pk <pk>', 'Primary key of the object to delete')
	.option('--checksum <checksum>', 'Optional: checksum for the object to delete, or "override". If not specified, the object will be retrieved then deleted.')
	.option('-f, --jsonfile <jsonfile>', 'Optional: name of a file containing JSON to be deleted, or stdin to read from stdin')
	.option('-m, --format <format>', 'Optional: format of output, either text (default), json or compactjson')
	.option('-a, --serverAlias <serverAlias>', 'Optional: alias of the server to use if other than the current default server')
	.action(del.commandDelete);

program
	.command('describe <resource>')
	.description('Describe the specified resource, can be: tables[/tablename], views[/viewname], license, serverinfo')
	.option('-a, --serverAlias <serverAlias>', 'Optional: alias of the server to use if other than the current default server')
	.action(describe.commandDescribe);

program.parse(process.argv);

if (process.argv.length < 2) {
	console.log('You must specify a command'.red);
	program.help();
}

exports.program = program;
