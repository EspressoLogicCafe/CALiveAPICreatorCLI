

# EspressoCLI
A Node.js command-line tool to access Espresso Logic REST API and Logic services. 
Refer to online documentation of creating and using Espresso Logic [REST API](http://docs.espressologic.com/docs/live-api) 


## Installation

1. Download [node.js](http://nodejs.org)
2. Install using `npm` by running the following:
```sh
$ npm install espresso-cli
```


## Features
	* Log in once per server, stay "logged in" for the lifetime of the API key
	* Can call GET, POST, PUT and DELETE
	* Can read objects from file or from stdin (suitable for pipework!)

## Command Line Service
```sh
$ espresso --help

  Usage: espresso [options] [command] 

  Commands:

    login [options]               Login to an Espresso Logic server
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

## Logon to an Espresso Logic Server
```sh
$ espresso login http://my.espressologic.com/rest/el-dev/demo/v1 -u username -p mypassword
Logging in...
This server licensed to: Espresso Logic
Login successful, API key will expire on: 2014-11-18T15:03:37.342Z
```


## See which Espresso server (if any) you are logged into
```sh
$ espresso status

You are currently logged in to server: https://eval.espressologic.com/rest/acme/demo/v1 as user demo
Defined aliases:
┌───────┬───────────────────────────────────────────────────────────┬───────┐
│ Alias │ Server                                                    │ User  │
├───────┼───────────────────────────────────────────────────────────┼───────┤
│ hr    │ https://acme.my.espressologic.com/rest/acme/hr/v2         │ hradm │
├───────┼───────────────────────────────────────────────────────────┼───────┤
│ demo  │ https://eval.espressologic.com/rest/acme/demo/v1          │ demo  │
└───────┴───────────────────────────────────────────────────────────┴───────┘
```


## DESCRIBE a system resource
This can return information about all tables, or one specific table,
or all views/one specific view, or get information about the server
or the server's license. The possible values for the resource are:
* tables
* tables/<table-name>
* views
* views/<view-name>
* license
* serverinfo

```sh
$ espresso describe tables

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
$ espresso describe tables/product

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
$ espresso get employee

demo:employee/1 employee_id:1 login:sam name:Sam Yosemite
demo:employee/2 employee_id:2 login:mlittlelamb name:Mary Little-Lamb
demo:employee/3 employee_id:3 login:sconnor name:Sarah Connor
demo:employee/4 employee_id:4 login:jkim name:John Kim
demo:employee/5 employee_id:5 login:bmcmanus name:Becky McManus
etc...
```

## GET a single REST endpoint (JSON format)
```sh
$ espresso get employee/4 -m json 
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
$ espresso post --help

  Usage: post <resource> [options]

  Options:

    -h, --help                       output usage information
    -j, --json <json>                JSON for the data being inserted
    -f, --jsonfile <jsonfile>        Name of a file containing JSON to be inserted, or stdin to read from stdin
    -m, --format <format>            Optional: format of output, either text (default), json or compactjson
    -a, --serverAlias <serverAlias>  Optional: alias of the server to use if other than the current default server

$ espresso post customer -j '{ "name": "new posted record","balance": 0,"credit_limit": 9000 }'

POST for customer:
I demo:customer/new%20posted%20record name:new posted record balance:0 credit_limit:9000
Request took: 61ms - # objects touched: 1
```

## PUT (update) a JSON Payload

```sh
$ espresso put --help

  Usage: put <resource> [options]

  Options:

    -h, --help                       output usage information
    -j, --json <json>                JSON string for the data being updated
    -f, --jsonfile <jsonfile>        Name of a file containing JSON to be updated, or stdin to read from stdin
    -m, --format <format>            Optional: format of output, either text (default), json or compactjson
    -a, --serverAlias <serverAlias>  Optional: alias of the server to use if other than the current default server
    
$ espresso put customer -j '{ "@metadata": {"checksum": "A:693190f461f5402e"  }, "name": "new posted record", "credit_limit": 8000  }'

PUT for customer:
U demo:customer/new%20posted%20record name:new posted record balance:0 credit_limit:8000
Request took: 42ms - # objects touched: 1
```

## DELETE a REST resource

```sh
$ espresso delete --help

  Usage: delete <resource> [options]

  Options:

    -h, --help                       output usage information
    -k, --pk <pk>                    Primary key of the object to delete
    --checksum <checksum>            Optional: checksum for the object to delete, or "override". If not specified, the object will be retrieved then deleted.
    -f, --jsonfile <jsonfile>        Optional: name of a file containing JSON to be deleted, or stdin to read from stdin
    -m, --format <format>            Optional: format of output, either text (default), json or compactjson
    -a, --serverAlias <serverAlias>  Optional: alias of the server to use if other than the current default server

espresso delete customer -k "new posted record" --checksum "A:e86aea2e0a4e74bf" 
```
## Logout

```sh
$ espresso logout
Logout successful
```
