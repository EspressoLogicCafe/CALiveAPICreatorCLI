
REM  Uses NodeJS and Live API Creator command line interface
REM  npm install liveapicreator-cli -g
REM  Live API Creator meta @ rest endpoints

REM  Note that the URL contains the entire path to the project 
call liveapicreator login -u demo -p Password1 http://localhost:8080/rest/default/nwindb2b/v1 -a localnw
call liveapicreator use localnw

REM Show the current license info (add --format json) for full EULA
REM liveapicreator or use the alias lac

REM License Info
call lac get @license

REM returns OK if server is up
call lac get @heartbeat

REM  Show All Tables and columns for selected table
call lac get @tables
call lac get @tables/nw:Customers

REM  Show All views and columns for selected view
call lac get @views
call lac get @views/nw:Current%20Product%20List

REM  Show All Resoures and attribute for selected resources (using ident)
call lac get @resources
call lac get @resources/2961

REM  Show All Store Proc and attribute for selected proc (using ident)
call lac get @procedures
REM call lac get @procedures/somename

REM Show the performance metrics for sql, rules, and admin SQL (add --format json) for detailed view
call lac get @perf --format json
call lac get @perf/sql?projectId=2047
call lac get @perf/rules?projectId=2047  
call lac get @perf/adminSql?projectId=2047 

REM List of Rules
call lac get @rules

REM API Project settings
call lac get @apioptions

REM Information on the default auth provider
call lac get @auth_provider_info/1000

REM  Swagger 1.2 doc or 2.0 after After release 2.1x
call lac get @docs

REM Information from the Auth Provider
call lac get @login_info