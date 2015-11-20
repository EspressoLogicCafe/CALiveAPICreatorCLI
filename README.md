

# LiveAPICreatorCLI
A Node.js command-line tool to access CA Live API Creator REST API and Logic services. 
Refer to online documentation of creating and using Live API Creator [REST API](http://ca-doc.espressologic.com/docs/live-api) 


## Installation

1. Make sure [node.js](http://nodejs.org) is installed
2. Install using `npm` by running the following:
```sh
$ npm install -g liveapicreator-cli
```

Note: on Unix and Mac, you will probably need to run this with sudo because of file permissions:

```sh
$ sudo npm install -g liveapicreator-cli
```

*Windows*: Please note that, on Windows, `npm install` will create an executable 
called `liveapicreator` in your
`<node_modules>/.bin` directory. If this directory is not in your `PATH`, you will probably
want to fix that, otherwise you'll have to specify the full path to the executable.


## Features

* Log in once per server, stay "logged in" for the lifetime of the API key
* Can call GET, POST, PUT and DELETE
* Can read/write objects from/to file or stdin (suitable for pipe work!)

## Command Line Service
```sh
$ liveapicreator --help

  Usage: liveapicreator \[options] [command] 

  Commands:

    login [options]               Login to an API server
    logout [options]              Logout from the current server, or a specific server
    use <alias>                   Use the specified server by default
    status                        Show the current server, and any defined server aliases
    get <resource> [options]      Retrieve some data for the given resource/table/view
    post <resource> [options]     Insert some data
    put <resource> [options]      Update some data
    delete <resource> [options]   Delete some data
    describe <resource> [options] Describe the specified resource, can be: tables[/tablename], views[/viewname], license, serverinfo

  Options:

    -h, --help     output usage information
    -V, --version  output the version number

```

## Logon to an API Server
```sh
$ liveapicreator login http://localhost:8080/APIServer/rest/default/demo/v1 -u username -p mypassword
Logging in...
This server licensed to: Live API Creator
Login successful, API key will expire on: 2015-11-18T15:03:37.342Z
```


## See which API server (if any) you are logged into
```sh
$ liveapicreator status

You are currently logged in to server: https://localhost:8080/APIServer/rest/default/demo/v1 as user: demo
Defined aliases:
┌───────┬───────────────────────────────────────────────────────────┬───────┐
│ Alias │ Server                                                    │ User  │
├───────┼───────────────────────────────────────────────────────────┼───────┤
│ hr    │ https://acme.my.espressologic.com/rest/acme/hr/v2         │ hradm │
├───────┼───────────────────────────────────────────────────────────┼───────┤
│ demo  │ https://eval.acme.server.com/rest/acme/demo/v1            │ demo  │
└───────┴───────────────────────────────────────────────────────────┴───────┘
```


## DESCRIBE a system resource
This can return information about all tables, or one specific table,
or all views/one specific view, or get information about the server
or the server's license. The possible values for the resource are:

* tables
* tables/&lt;table-name>
* views
* views/&lt;view-name>
* license
* serverinfo

```sh
$ liveapicreator describe tables

DB    Table
----  -------------------
demo  customer
demo  employee
demo  employee_picture
demo  LineItem
demo  product
demo  PurchaseOrder
demo  purchaseorder_audit
```

```sh
$ liveapicreator describe tables/product

Name            Type     Size      PK
--------------  -------  --------  --
product_number  BIGINT         19  *
name            VARCHAR        50
price           DECIMAL        19
icon            BLOB        65535
full_image      BLOB     16777215
```


## GET 
```sh
  Usage: get <resource> [options] 

  Options:

    -h, --help                       output usage information
    -k, --pk <pk>                    Optional: primary key of the object to retrieve
    -f, --filter <filter>            Optional: filter, e.g. "balance<1000"
    -s, --sort <sort>                Optional: sorting order, e.g. "balance,name desc"
    -z, --pagesize <pagesize>        Optional: up to how many rows to return per level
    -m, --format <format>            Optional: format of output, either text (default), json or compactjson    --truncate <length>
    -a, --serverAlias <serverAlias>  Optional: alias of the server to use if other than the current default server
```


## Get a single REST endpoint (compressed format)
```sh
$ liveapicreator get employee

demo:employee/1 employee_id:1 login:sam name:Sam Yosemite
demo:employee/2 employee_id:2 login:mlittlelamb name:Mary Little-Lamb
demo:employee/3 employee_id:3 login:sconnor name:Sarah Connor
demo:employee/4 employee_id:4 login:jkim name:John Kim
demo:employee/5 employee_id:5 login:bmcmanus name:Becky McManus
etc...
```

## GET a single REST endpoint (JSON format)
```sh
$ liveapicreator get employee/4 -m json 
[
  {
    "@metadata": {
      "href": "http://localhost:8080/KahunaService/rest/el-local/demo/v1/demo:employee/4",
      "checksum": "A:3ed29188014675ec",
      "links": [
        {
          "href": "http://localhost:8080/KahunaService/rest/el-local/demo/v1/demo:employee_picture?filter=employee_id%20%3D%204",
          "rel": "children",
          "role": "employee_pictureList",
          "type": "http://localhost:8080/KahunaService/rest/el-local/demo/demo:employee_picture"
        },
        {
          "href": "http://localhost:8080/KahunaService/rest/el-local/demo/v1/demo:PurchaseOrder?filter=salesrep_id%20%3D%204",
          "rel": "children",
          "role": "PurchaseOrderList",
          "type": "http://localhost:8080/KahunaService/rest/el-local/demo/demo:PurchaseOrder"
        }
      ]
    },
    "employee_id": 4,
    "login": "jkim",
    "name": "John Kim"
  }
]
```

## POST (insert) a JSON payload 

```sh
$ liveapicreator post --help

  Usage: post <resource> [options]

  Options:

    -h, --help                       output usage information
    -j, --json <json>                JSON for the data being inserted
    -f, --jsonfile <jsonfile>        Name of a file containing JSON to be inserted, or stdin to read from stdin
    -m, --format <format>            Optional: format of output, either text (default), json or compactjson
    -a, --serverAlias <serverAlias>  Optional: alias of the server to use if other than the current default server

$ liveapicreator post customer -j '{ "name": "new posted record","balance": 0,"credit_limit": 9000 }'

POST for customer:
I demo:customer/new%20posted%20record name:new posted record balance:0 credit_limit:9000
Request took: 61ms - # objects touched: 1
```

## PUT (update) a JSON Payload

```sh
$ liveapicreator put --help

  Usage: put <resource> [options]

  Options:

    -h, --help                       output usage information
    -j, --json <json>                JSON string for the data being updated
    -f, --jsonfile <jsonfile>        Name of a file containing JSON to be updated, or stdin to read from stdin
    -m, --format <format>            Optional: format of output, either text (default), json or compactjson
    -a, --serverAlias <serverAlias>  Optional: alias of the server to use if other than the current default server
    
$ liveapicreator put customer -j '{ "@metadata": {"checksum": "A:693190f461f5402e"  }, "name": "new posted record", "credit_limit": 8000  }'

PUT for customer:
U demo:customer/new%20posted%20record name:new posted record balance:0 credit_limit:8000
Request took: 42ms - # objects touched: 1
```

## DELETE a REST resource

```sh
$ liveapicreator delete --help

  Usage: delete <resource> [options]

  Options:

    -h, --help                       output usage information
    -k, --pk <pk>                    Primary key of the object to delete
    --checksum <checksum>            Optional: checksum for the object to delete, or "override". If not specified, the object will be retrieved then deleted.
    -f, --jsonfile <jsonfile>        Optional: name of a file containing JSON to be deleted, or stdin to read from stdin
    -m, --format <format>            Optional: format of output, either text (default), json or compactjson
    -a, --serverAlias <serverAlias>  Optional: alias of the server to use if other than the current default server

liveapicreator delete customer -k "new posted record" --checksum "A:e86aea2e0a4e74bf" 
```
## Logout

```sh
$ liveapicreator logout
Logout successful
```
