

# EspressoCLI
A command-line tool to access Espresso Logic services. 
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
$ >espresso --help

  Usage: espresso [options] [command]

  Commands:

    login [options]              Login to an Espresso Logic server
    logout [options]             Logout from the current server, or a specific server
    use <alias>                  Use the specified server by default
    status                       Show the current server, and any defined server aliases
    get [options] <resource>     Retrieve some data for the given resource/table/view
    post [options] <resource>    Insert some data
    put [options] <resource>     Update some data
    delete [options] <resource>  Delete some data

  Options:

    -h, --help     output usage information
    -V, --version  output the version number

```

## Logon once to an Espresso Logic Server
```sh
$ espresso login -U username -p mypassword -u http://my.espressologic.com/rest/el-dev/demo/v1
Logging in...
This server licensed to: Espresso Logic
Login successful, API key will expire on: 2014-11-18T15:03:37.342Z

```

## GET 
```sh
  Usage: get [options] <resource>

  Options:

    -h, --help                       output usage information
    -k, --pk <pk>                    Name of the table or resource
    -f, --filter <filter>            Optional: filter, e.g. "balance<1000"
    -s, --sort <sort>                Optional: sorting order, e.g. "balance,name desc"
    -z, --pagesize <pagesize>        Optional: up to how many rows to return per level
    -m, --format <format>            Optional: format of output, either text (default), json or compactjson    --truncate <length>
    -a, --serverAlias <serverAlias>  Optional: alias of the server to use if other than the current default server
```

## GET a list of Tables/Views/Procedures/Resources
1. list of all tables @tables
2. list of all veiws @views
3. list of all stored procedures @procedures
4. list of all custom resources @resources

```sh
$ espresso get @tables

@tables/demo:customer prefix:demo entity:customer name:demo:customer
@tables/demo:employee prefix:demo entity:employee name:demo:employee
@tables/demo:employee_picture prefix:demo entity:employee_picture
@tables/demo:LineItem prefix:demo entity:LineItem name:demo:LineItem
@tables/demo:product prefix:demo entity:product name:demo:product
@tables/demo:PurchaseOrder prefix:demo entity:PurchaseOrder
@tables/demo:purchaseorder_audit prefix:demo entity:purchaseorder_audit

```

## Get a single REST endpoint (compressed format)
```sh
$ espresso get customer

demo:customer/Alpha%20and%20Sons name:Alpha and Sons balance:4484
demo:customer/Argonauts name:Argonauts balance:1858 credit_limit:2000
demo:customer/Baja%20Software%20Ltd name:Baja Software Ltd balance:635
demo:customer/Black%20Sheep%20Industries name:Black Sheep Indus... balance:76
demo:customer/Bravo%20Hardware name:Bravo Hardware balance:2996
demo:customer/Charlie's%20Construction name:Charlie's Constru... balance:1351
demo:customer/Delta%20Engineering name:Delta Engineering balance:2745
demo:customer/Echo%20Environmental%20Services name:Echo Environmenta...
demo:customer/Foxtrot%20Farm%20Supply name:Foxtrot Farm Supply balance:2957
demo:customer/Golf%20Industries name:Golf Industries balance:3359
demo:customer/Hotel%20Services name:Hotel Services balance:4481
demo:customer/India%20Investigators name:India Investigators balance:5696
demo:customer/Jack%20Trading%20Co. name:Jack Trading Co. balance:46
demo:customer/Jill%20Exports%20Ltd. name:Jill Exports Ltd. balance:43
demo:customer/Juliet%20Dating%20Inc. name:Juliet Dating Inc. balance:1297
demo:customer/Kilo%20Combustibles name:Kilo Combustibles balance:6476
demo:customer/La%20Jolla%20Ice%20Cream name:La Jolla Ice Cream balance:59
demo:customer/Lima%20Citrus%20Supply name:Lima Citrus Supply balance:65
demo:customer/Mike%20and%20Bob's%20Construction name:Mike and Bob's Co...
demo:customer/November%20Nuptials%20Wedding%20Co name:November Nuptials...
```

## GET a single REST endpoint (JSON format)
```sh
$ espresso get -k "Alpha and Sons" -m json customer
[
  {
    "@metadata": {
      "href": "http://demodev.espressologic.com/rest/el-dev/demo/v1/demo:custome
r/Alpha%20and%20Sons",
      "checksum": "A:e86aea2e0a4e74bf",
      "links": [
        {
          "href": "http://demodev.espressologic.com/rest/el-dev/demo/v1/demo:Pur
chaseOrder?filter=customer_name%20%3D%20'Alpha%20and%20Sons'",
          "rel": "children",
          "role": "PurchaseOrderList",
          "type": "http://demodev.espressologic.com/rest/el-dev/demo/demo:Purcha
seOrder"
        }
      ]
    },
    "name": "Alpha and Sons",
    "balance": 4484,
    "credit_limit": 9000
  }
]
```

## POST (insert) a JSON payload 

```sh
$ espresso post --help

  Usage: post [options] <resource>

  Options:

    -h, --help                       output usage information
    -j, --json <json>                JSON for the data being inserted
    -f, --jsonfile <jsonfile>        Name of a file containing JSON to be inserted, or stdin to read from stdin
    -m, --format <format>            Optional: format of output, either text (default), json or compactjson
    -a, --serverAlias <serverAlias>  Optional: alias of the server to use if other than the current default server

$ espresso post -j { "name": "new posted record","balance": 0,"credit_limit": 9000 } customer
```

## PUT (update) a JSON Payload

```sh
$ espresso put --help

  Usage: put [options] <resource>

  Options:

    -h, --help                       output usage information
    -j, --json <json>                JSON string for the data being updated
    -f, --jsonfile <jsonfile>        Name of a file containing JSON to be updated, or stdin to read from stdin
    -m, --format <format>            Optional: format of output, either text (default), json or compactjson
    -a, --serverAlias <serverAlias>  Optional: alias of the server to use if other than the current default server
    
$ espresso put -j { "@metadata": {"checksum": "A:e86aea2e0a4e74bf"  }, "balance": 0  } customer
```

## DELETE a REST resource

```sh
$ espresso delete --help

  Usage: delete [options] <resource>

  Options:

    -h, --help                       output usage information
    -k, --pk <pk>                    Primary key of the object to delete
    --checksum <checksum>            Optional: checksum for the object to delete, or "override". If not specified, the object will be retrieved then deleted.
    -f, --jsonfile <jsonfile>        Optional: name of a file containing JSON to be deleted, or stdin to read from stdin
    -m, --format <format>            Optional: format of output, either text (default), json or compactjson
    -a, --serverAlias <serverAlias>  Optional: alias of the server to use if other than the current default server

espresso delete  -k "new posted record" --checksum "A:e86aea2e0a4e74bf"  customer
```
## Logout

```sh
$ espresso logout
Logout successful
```
