# Mock Server Lite[](#mock-server-lite) [![](https://img.shields.io/npm/v/@r35007/mock-server?label=npm)](https://img.shields.io/npm/v/@r35007/mock-server?label=npm) [![](https://img.shields.io/npm/l/@r35007/mock-server?color=blue)](https://img.shields.io/npm/l/@r35007/mock-server?color=blue) [![](https://img.shields.io/npm/types/@r35007/mock-server)](https://img.shields.io/npm/types/@r35007/mock-server)

Get a full REST API with **zero coding** in **less than 30 seconds** (seriously)

Created with <3 for front-end developers who need a quick back-end for prototyping and mocking.

Now also available as a VSCodeExtension `thinker.mock-server-lite`.

This is the lite version of MocK Server. 

## Table of contents

- [Getting started](#getting-started)
- [Using JS Module](#using-js-module)
- [Route Config](#route-config)
  - [Set Delay Response](#set-delay-response)
  - [Set Custom StatusCode](#set-custom-statuscode)
  - [Custom Mock](#custom-mock)
  - [Add Middleware](#add-middleware)
- [Middleware Utils](#middleware-utils)
  - [IterateResponse](#iterateresponse)
  - [IterateRoutes](#iterateroutes)
  - [AdvancedSearch](#advancedsearch)
    - [Filter](#filter)
    - [Paginate](#paginate)
    - [Sort](#sort)
    - [Slice](#slice)
    - [Operators](#operators)
    - [Full text search](#full-text-search)
  - [CrudOperations](#crudoperations)
  - [SetStoreDataToMock](#setstoredatatomock)
  - [ReadOnly](#readonly)
- [Injectors](#injectors)
  - [Inject Route Configs](#inject-route-configs)
  - [Override Existing Route Configs](#override-existing-route-configs)
  - [Common Route Configs](#common-route-configs)
- [Store Data](#store-data)
  - [Route Store](#route-store)
  - [Local Store](#local-store)
- [Route Rewriters](#route-rewriters)
- [Locals](#locals)
  - [Dynamic Route Config](#dynamic-route-config)
- [Config](#config)
  - [Alternative Port](#config)
  - [Set Host](#config)
  - [Set RootPath to fetch Files](#config)
  - [Add Base Route](#config)
  - [Static File Server](#config)
- [Default Routes](#default-routes)
- [Home Page](#home-page)
- [CLI Usage](#cli-usage)
- [API](#api)
  - [MockServer](#mockserver)
  - [Create](#create)
  - [Destroy](#destroy)
  - [launchServer](#launchserver)
  - [rewriter](#rewriter)
  - [defaults](#defaults)
  - [resources](#resources)
  - [defaultRoutes](#defaultroutes)
  - [addDbData](#adddbdata)
  - [getDb](#getdb)
  - [startServer](#startserver)
  - [stopServer](#stopserver)
  - [resetServer](#resetserver)
  - [pageNotFound](#pagenotfound)
  - [errorHandler](#errorhandler)
  - [Setters](#setters)
  - [Variables](#variables)
  - [Validators](#validators)
- [Author](#author)
- [License](#license)

## Getting started

Install Mock Server

```sh
npm install -g @r35007/mock-server
```

Create a `db.json` file with some data.

```jsonc
{
  "posts": [{ "id": 1, "title": "mock-server", "author": "r35007" }],
  "comments": [{ "id": 1, "body": "some comment", "postId": 1 }],
  "profile": { "name": "r35007" }
}
```

Start Mock Server

```sh
mock-server --watch ./db.json
```

Now if you go to [http://localhost:3000/posts/1](http://localhost:3000/posts/1), you'll get

```json
{ "id": 1, "title": "mock-server", "author": "r35007" }
```

## Using JS Module

First install nodemon for watching changes

```sh
npm install -g nodemon
```

Create `server.js` File

```js
const { MockServer } = require("@r35007/mock-server"); // use import if using ES6 module

const mockServer = new MockServer("./config.json"); // Creates a Mock Server instance
// or
// const mockServer = MockServer.Create("./config.json"); // Creates a Mock Server single instance

mockServer.launchServer(
  "./db.json",
  "./middleware.js",
  "./injectors.json",
  "./rewriters.json",
  "./store.json"
); // Starts the Mock Server.

//or

const app = mockServer.app;

const rewriter = mockServer.rewriter("./rewriters.json");
app.use(rewriter); // make sure to add this before defaults and resources

const defaults = mockServer.defaults({ noGzip: true });
app.use(defaults);

const resources = mockServer.resources(
  "./db.json",
  "./middleware.js",
  "./injectors.json",
  "./store.json"
);
app.use(resources);

const defaultRoutes = mockServer.defaultRoutes();
app.use(defaultRoutes);

// make sure to add this at last
app.use(mockServer.pageNotFound);
app.use(mockServer.errorHandler);

mockServer.startServer(3000, "localhost");
```

Now go to terminal and type the following command to start the Mock Server.

```sh
nodemon server.js
```

## **Route Config**

Create a db.json file. Pay attention to start every route with /.
For Example:

`db.json`

```jsonc
{
  "/route/1, /route/2": {
    // /route/1 and /route/2 shares the same config and mock data
    "_config": true, // Make sure to set this to true to use this object as a route configuration.
    "id": "id-unique", // sets a unique id for each route
    "description": "", // Description about this Route.
    "delay": 2000, // in milliseconds
    "statusCode": 200, // in number between 100 to 600
    "middlewareNames": ["_IterateResponse"], // list of middleware names to be called
    "middlewares": "", // Can give a list of express Middlewares If using in .js file
    "mock": [{ "name": "foo" }, { "name": "bar" }],
    "store": {} // helps to store any values for later use
  },
  "/routeName3": {
    "name": "foo",
    "age": "bar",
    "description": "Note: Since _config attribute is not set to true this whole object will be sent as a response"
  }
}
```

### **Set Delay Response**

`delay` helps you to set a custom delay to your routes.
Note : The delay yo set must be in milliseconds and of type number

```jsonc
{
  "/customDelay": {
    "_config": true,
    "delay": 2000,
    "description": "Note: give delay in milliseconds",
    "mock": "This is response is received with a delay of 2000 milliseconds"
  }
}
```

Now if you go to [http://localhost:3000/customDelay](http://localhost:3000/customDelay), you'll get the response in a delay of 2 seconds.

### **Set Custom StatusCode**

`statusCode` helps you set a custom statusCode to your routes.
It must be of type number and between 100 to 600.

```jsonc
{
  "/customStatusCode": {
    "_config": true,
    "statusCode": 500,
    "mock": "This is response is received with a statusCode of 500"
  }
}
```

Now if you go to [http://localhost:3000/customStatusCode](http://localhost:3000/customStatusCode), you'll get the response with a `500` statusCode

### **Add Middleware**

You can add n number of middleware to a route which helps you to manipulate or log the data.

`middleware.js`

```js
exports.DataWrapper = (req, res, next) => {
  res.locals.data = {
    status: "Success",
    message: "Retrived Successfully",
    result: res.locals.data,
  };
  next();
};
```

`db.json`

```jsonc
{
  "/customMiddleware": {
    "_config": true,
    "description": "Note: This middleware must be available in the 'middleware.js' by the below given names. This 'DataWrapper' will be called on every hit of this route.",
    "mock": "This data will be wrapped by the middleware response object",
    "middlewareNames": ["DataWrapper"]
  }
}
```

Note: A middleware must be available at the name of the middlewareNames given in `db.json`
[http://localhost:3000/customMiddleware](http://localhost:3000/customMiddleware).

## **Middleware Utils**

Use the predefined middleware to speedup your development and for ease of access.

### **IterateResponse**

setting middleware to `_IterateResponse` helps to send you a iterate the response one after the other in the mock array for each url hit.

example:

```jsonc
{
  "/middleware/utils/example/_IterateResponse": {
    "_config": true,
    "description": "This route iterates through each data. Try to hit again to see the data change. Note: The data must be of type array",
    "mock": [
      {
        "userId": 1,
        "id": 1,
        "title": "Lorem ipsum dolor sit.",
        "body": "Lorem ipsum dolor sit amet consectetur adipisicing elit. Est, dolorem."
      },
      {
        "userId": 1,
        "id": 2,
        "title": "Lorem ipsum dolor sit.",
        "body": "Lorem ipsum dolor sit amet consectetur adipisicing elit. Est, dolorem."
      },
      {
        "userId": 1,
        "id": 3,
        "title": "Lorem ipsum dolor sit.",
        "body": "Lorem ipsum dolor sit amet consectetur adipisicing elit. Est, dolorem."
      }
    ],
    "middlewareNames": ["_IterateResponse"]
  }
}
```

Now go and hit [http://localhost:3000/middleware/utils/example/\_IterateResponse](http://localhost:3000/middleware/utils/example/_IterateResponse). For each hit you will get the next object in an array from the photos data.

### **IterateRoutes**

setting middleware to `_IterateRoutes` helps to send you a iterate the route one after the other in the mock array for each url hit.

example:

```jsonc
{
  "/middleware/utils/example/_IterateRoutes": {
    "_config": true,
    "description": "This route iterates through each route provide in the mock. Try to hit again to see the route change. Note: The data must be of type array",
    "mock": ["/injectors/1", "/injectors/2"],
    "middlewareNames": ["_IterateRoutes"]
  },
  "/injectors/1": "/injectors/1 data",
  "/injectors/2": "/injectors/2 data"
}
```

Now go and hit [http://localhost:3000/middleware/utils/example/\_IterateRoutes](http://localhost:3000/middleware/utils/example/_IterateRoutes). For each hit the route is passed to next matching url provided in the mock list.

### **AdvancedSearch**

`_AdvancedSearch` middleware helps to filter and do the advanced search from data.Following are the operations performed by this method.

#### Filter

Use `.` to access deep properties

```
GET /posts?title=mock-server&author=typicode
GET /posts?id=1&id=2
GET /comments?author.name=typicode
```

#### Paginate

Use `_page` and optionally `_limit` to paginate returned data.

In the `Link` header you'll get `first`, `prev`, `next` and `last` links.

```
GET /posts?_page=7
GET /posts?_page=7&_limit=20
```

_10 items are returned by default_

#### Sort

Add `_sort` and `_order` (ascending order by default)

```
GET /posts?_sort=views&_order=asc
GET /posts/1/comments?_sort=votes&_order=asc
```

For multiple fields, use the following format:

```
GET /posts?_sort=user,views&_order=desc,asc
```

#### Slice

Add `_start` and `_end` or `_limit` (an `X-Total-Count` header is included in the response)

```
GET /posts?_start=20&_end=30
GET /posts/1/comments?_start=20&_end=30
GET /posts/1/comments?_start=20&_limit=10
```

_Works exactly as [Array.slice](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/slice) (i.e. `_start` is inclusive and `_end` exclusive)_

#### Operators

Add `_gte` or `_lte` for getting a range

```
GET /posts?views_gte=10&views_lte=20
```

Add `_ne` to exclude a value

```
GET /posts?id_ne=1
```

Add `_like` to filter (RegExp supported)

```
GET /posts?title_like=server
```

#### Full text search

Add `q` or `_text`

```
GET /posts?q=internet&_text=success
```

### **CrudOperations**

`_CrudOperations` middleware handles all the crud operations of the given data.
By default it also handles the `_AdvancedSearch` operations.
Note : the mock must of type Array of objects and must contain a unique value of attribute `id`.
this `id` attribute can also be changes using `config.id`.

For example: `config.json`

```jsonc
{
  "id": "_id"
}
```

### **SetStoreDataToMock**

`_SetStoreDataToMock` sets every store data to Mock data.
This overrides the existing mock with the `store`.

### **ReadOnly**

`_ReadOnly` forbidden every Http method calls except `GET` call.

## **Injectors**

Injectors helps to inject a Route Configs explicitly.
This also helps to provide a common route configs.
Injector uses [`path-to-regexp`](https://github.com/pillarjs/path-to-regexp) pattern recognition to set config for multiple routes.

### **Inject Route Configs**

Here we are explicitly injecting `delay`, `middlewareNames`, `statusCode` to the `/posts` route.
You can any route configs to a specific or to a group of routes using Injectors.

- Injectors use `path-to-regexp` package for route pattern recognition.
- Click [path-to-regexp](https://www.npmjs.com/package/path-to-regexp) for more details.

example : `injectors.json`

```jsonc
[
  {
    "routeToMatch": "/injectors/:id",
    "description": "This description is injected using the injectors by matching the pattern '/injectors/:id'."
  }
]
```

### **Override Existing Route Configs**

Setting `override` flag to true helps to override the existing config of that route.

For example :

`injectors.json`

```jsonc
[
  {
    "routeToMatch": "/injectors/2",
    "override": true,
    "mock": "This data is injected using the injectors by matching the pattern '/injectors/2'."
  },
  {
    "routeToMatch": "/injectors/:id",
    "override": true,
    "exact": true,
    "statusCode": 200,
    "mock": "This data is injected using the injectors by exactly matching the route '/injectors/:id'."
  },
  {
    "routeToMatch": "/(.*)",
    "override": true,
    "middlewareNames": ["...", "CustomLog"]
  }
]
```

Note: Use `["..."]` If you want to add the existing middlewareNames.

### **Common Route Configs**

Using wildcards you can set a common route configs to all the routes.
`/(.*)` - matches all the routes.

For example :

`injectors.json`

```jsonc
[
  {
    "routeToMatch": "/(.*)",
    "description": "This Description is injected using the injectors. Set 'Override' flag to true to override the existing config values."
  },
  {
    "routeToMatch": "/(.*)",
    "override": true,
    "middlewareNames": ["...", "CustomLog"]
  }
]
```

Make sure you give `/(.*)` at the end of the `injectors.json` object to set route configs to all the routes.

## **Store Data**

Store used to store any values which can be used later for any purpose like response manipulation or logging etc..

### **Route Store**

Route store helps to store any values which can be accessed on by that particular route.
This stores values cannot be able to accessed by the other routes.
Route Store can be accessed using `res.locals.routeConfig.store` inside the middleware.

The middlewareNames `_CrudOperations`, `_IterateRoutes`, `_IterateResponse` uses the Route store to manipulate response.

### **Local Store**

Local Store helps to store and share data between routes.
This can be accessed using `res.locals.store` inside the middleware.

## **Route Rewriters**

Create a `rewriters.json` file. Pay attention to start every route with `/`.

- Rewriters use `express-urlrewrite` package to rewrite the urls.
- Click [here](https://www.npmjs.com/package/express-urlrewrite) for more information about url rewrite.

```jsonc
{
  "/api/*": "/$1",
  "/:resource/:id/show": "/:resource/:id",
  "/posts/:category": "/posts?category=:category",
  "/articles?id=:id": "/posts/:id"
}
```

`server.js`

```js
const mockServer = MockServer.Create();
mockServer.launchServer(
  "./db.json",
  "./middleware.js",
  "./injectors.json",
  "./rewriters.json"
);
```

Now you can access resources using additional routes.

```sh
/api/posts # → /posts
/api/posts/1  # → /posts/1
/posts/1/show # → /posts/1
/posts/javascript # → /posts?category=javascript
/articles?id=1 # → /posts/1
```

## **Locals**

`res.locals` helps to access the current route config, `mock`, `statusCode` etc..
Here are the available options in `res.locals`

```ts
interface Locals {
  routePath: string;
  routeConfig: {
    _config?: boolean;
    id?: string;
    description?: string;
    statusCode?: number;
    delay?: number;
    mock?: any;
    store?: object;
    middlewareNames?: string[];
    middlewares?: Array<express.RequestHandler>;
  };
  data: any; // response will be sent using this attribute value.
  store: object;
  getDb: (ids?: string[], routePaths?: string[]) => Routes; // This method helps to get other route configs and values.
  config: Config; // gives you the current mock server configuration.
}
```

### **Dynamic Route Config**

RouteConfigs are mutable. Means we can able to modify the routeConfigs in runtime using middleware.
For Example:

`middleware.js`

```js
exports._Status500 = (_req, res, next) => {
  const locals = res.locals;
  const routeConfig = locals.routeConfig;
  routeConfig.statusCode = 500;
  routeConfig.mock = "Failed Response";
  next();
};
```

## **Config**

you can provide your own config by passing the config object in the `MockServer` constructor. For Example :

`server.js` :

```js
// These are default config. You can provide your custom config as well.
const config = {
  port: 3000, // by default mock will be launched at this port. http://localhost:3000/
  host: "localhost",
  root: process.cwd(), // all paths will be relative to this path. Please provide a absolute path here.
  base: "/", // all routes will be prefixed with the given baseUrl.
  staticDir: "public", // Please provide a folder path. This will be hosted locally and all files will be statically accessed
  reverse: false, // If true routes will be generated in reverse order
  bodyParser: true, // Sets the bodyParser
  id: "id", // Set the id attribute here. Helps to do Crud Operations. For example: 'id': "_id"
  logger: true, // If False no logger will be shown
  noCors: false, // If false cross origin will not be handled
  noGzip: false, // If False response will not be compressed
  readOnly: false, // If true only GET call is allowed
};

new MockServer(config).launchServer("./db.json");
```

## Default Routes

- `Home Page` - [http://localhost:3000](http://localhost:3000)
- `Db` - [http://localhost:3000/\_db](http://localhost:3000/_db)
- `Rewriters` - [http://localhost:3000/\_rewriters](http://localhost:3000/_rewriters)
- `Store` - [http://localhost:3000/\_store](http://localhost:3000/_store)

## **Home Page**

![Home Page](https://r35007.github.io/Mock-Server/src/img/homePage.png)

## CLI Usage

```sh
$ mock-server --help
Options:
  -c, --config           Path to config file                            [string]
  -P, --port             Set port                                [default: 3000]
  -H, --host             Set host                         [default: "localhost"]
  -m, --middleware       Paths to middleware file                      [string]
  -i, --injectors        Path to Injectors file                         [string]
  -s, --store            Path to Store file                             [string]
  -r, --rewriters        Path to Rewriter file                          [string]
      --staticDir, --sd  Set static files directory                     [string]
  -b, --base             Set base route path                            [string]
      --readOnly, --ro   Allow only GET requests                       [boolean]
      --noCors, --nc     Disable Cross-Origin Resource Sharing         [boolean]
      --noGzip, --ng     Disable GZIP Content-Encoding                 [boolean]
  -l, --logger           Enable logger                 [boolean] [default: true]
      --sample, --ex     Create Sample                [boolean] [default: false]
  -w, --watch            Watch file(s)                [boolean] [default: false]
  -S, --snapshots        Set snapshots directory                  [default: "."]
  -h, --help             Show help                                     [boolean]
  -v, --version          Show version number                           [boolean]

Examples:
  index.js db.json
  index.js --watch db.json
  index.js --sample --watch
  index.js http://jsonplaceholder.typicode.com/db

https://r35007.github.io/Mock-Server/
```

## API

### **MockServer**

returns the instance of the mockServer.

```js
const { MockServer } = require("@r35007/mock-server");
const mockServer = new MockServer("./config.json");
```

**`Params`**

| Name   | Type            | Required | Description                           |
| ------ | --------------- | -------- | ------------------------------------- |
| config | string / object | No       | This object sets the port, host etc.. |

### **Create**

returns the single instance of the mockServer.

```js
const { MockServer } = require("@r35007/mock-server");
const mockServer = MockServer.Create("./config.json");
```

**`Params`**

| Name   | Type            | Required | Description                           |
| ------ | --------------- | -------- | ------------------------------------- |
| config | string / object | No       | This object sets the port, host etc.. |

### **Destroy**

stops the server and clears the instance of the mockServer.
returns promise

```js
const { MockServer } = require("@r35007/mock-server");
await MockServer.Destroy();
```

### **launchServer**

It validates all the params in the MockServer, loads the resources and starts the server.

```js
mockServer.launchServer(
  "./db.json",
  "./middleware.js", // middleware must be of type .js
  "./injectors.json",
  "./rewriters.json",
  "./store.json"
);
```

**`Params`**

| Name       | Type            | Required | Description                                             |
| ---------- | --------------- | -------- | ------------------------------------------------------- |
| db         | string / object | No       | This object generates the local rest api.               |
| middleware | string / object | No       | Here you initialize the needed custom middleware        |
| injectors  | string / object | No       | Helps to inject a route configs for the existing routes |
| rewriters  | string / object | No       | Helps to set route rewriters                            |
| store      | string / object | No       | Helps to store values and share between routes          |

### **rewriter**

Sets the route rewrites and return the router of the rewriters;

```js
const rewriters = mockServer.rewriter("./rewriters.json");
app.use(rewriters);
```

**`Params`**

| Name      | Type            | Required | Description       |
| --------- | --------------- | -------- | ----------------- |
| rewriters | string / object | No       | Give the Rewrites |

### **defaults**

returns the list of default middlewares.
Also helps to host a static directory.

```js
const defaults = mockServer.defaults({ staticDir: "./public", readOnly: true });
app.use(defaults);
```

- options
  - `staticDir` path to static files
  - `logger` enable logger middleware (default: true)
  - `bodyParser` enable body-parser middleware (default: true)
  - `noGzip` disable Compression (default: false)
  - `noCors` disable CORS (default: false)
  - `readOnly` accept only GET requests (default: false)

### **resources**

Sets the routes and returns the resources router.

```js
const resources = mockServer.resources(
  "./db.json",
  "./middleware.js",
  "./injectors.json",
  "./store.json"
);
app.use(resources);
```

**`Params`**

| Name       | Type            | Required | Description                                             |
| ---------- | --------------- | -------- | ------------------------------------------------------- |
| db         | string / object | No       | This object generates the local rest api.               |
| middleware | string / object | No       | Here you initialize the needed custom middleware        |
| injectors  | string / object | No       | Helps to inject a route configs for the existing routes |
| store      | string / object | No       | Helps to store values and share between routes          |

### **defaultRoutes**

Returns router with some default routes.

```js
const defaultsRoutes = mockServer.defaultRoutes();
app.use(defaultsRoutes);
```

### **addDbData**

adds a new data to the existing db.

```js
mockServer.addDbData(db);
```

**`Params`**

| Name | Type   | Required | Description                             |
| ---- | ------ | -------- | --------------------------------------- |
| db   | object | No       | Give the new data to add to existing Db |

### **getDb**

Returns the routes

```js
const routes = mockServer.getDb(); // If param is not present return all the route values
```

**`Params`**

| Name       | Type     | Required | Description             |
| ---------- | -------- | -------- | ----------------------- |
| ids        | string[] | No       | Give List of route ids  |
| routePaths | string[] | No       | Give List of routePaths |

### **startServer**

Returns a Promise of `Server`. - helps to start the app server externally

```js
const server = await mockServer.startServer(3000, "localhost");
```

**`Params`**

| Name | Type   | Required | Description     |
| ---- | ------ | -------- | --------------- |
| port | number | No       | Set custom Port |
| host | string | No       | Set custom Host |

### **stopServer**

Returns a Promise of Boolean. - helps to stop the app server externally

```js
const isStopped = await mockServer.stopServer();
```

### **resetServer**

Clears out all values and resets the server for a fresh start.
By default this method will be called on `mockServer.stopServer()` method.

```js
mockServer.resetServer();
```


### **pageNotFound**

It is a middleware to handle a page not found error.
Please use it at the end of all routes.

```js
app.use(mockServer.pageNotFound);
```

### **errorHandler**

It is a middleware to handle a any error occur in server.
Please use it at the end of all routes.

```js
app.use(mockServer.errorHandler);
```

### **Setters**

set the db, middleware, injectors, rewriters, config, store

```js
mockServer.setData(db, middleware, injectors, rewriters, store, config);

//or

mockServer.setConfig(config);
mockServer.setMiddleware(middleware);
mockServer.setInjectors(injectors);
mockServer.setRewriters(rewriters);
mockServer.setStore(store);
mockServer.setDb(Db, Injectors, options, entryCallBack, finallCallback);
```

**`Params`**

The same as the [MockServer](#mockserver)

### **Variables**

Other useful variables.

```js
// Please avoid directly modify or setting values to these variable.
// Use Setter method to modify or set any values to these variables.
const app = mockServer.app;
const server = mockServer.server;
const router = mockServer.router;
const data = mockServer.data;

const db = mockServer.db;
const middleware = mockServer.middleware;
const injectors = mockServer.injectors;
const rewriters = mockServer.rewriters;
const config = mockServer.config;
const store = mockServer.store;
const initialDb = mockServer.initialDb;
const initialStore = mockServer.initialStore;
```

### **Validators**

These helps to return a valid data from provided file path or object.

```js
// called only when the given data is in .Har format and called at each entry
const entryCallback = (entry, routePath, routeConfig) => {
  return { [routePath]: routeConfig };
};
// called only when the given data is in .Har format and called at end of the entry loop
const finalCallBack = (data, db) => {
  return db; // what ever you return here will be given back
};

const options = {
  reverse: true, // If true the db will be generated in reverse order
};

const db = mockServer.getValidDb(
  "db.json",
  "injectors.json",
  options,
  entryCallback,
  finalCallBack
);
const middleware = mockServer.getValidMiddleware(middleware);
const injectors = mockServer.getValidInjectors(injectors);
const rewriters = mockServer.getValidRewriters(rewriters);
const config = mockServer.getValidConfig(config);
const store = mockServer.getValidStore(store);
```

## Author

**Sivaraman** - [sendmsg2siva.siva@gmail.com](sendmsg2siva.siva@gmail.com)

- _GitHub_ - [https://github.com/R35007/Mock-Server](https://github.com/R35007/Mock-Server)

## License

MIT