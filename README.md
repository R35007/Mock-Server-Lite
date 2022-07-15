# Mock Server Lite[](#mock-server-lite) [![](https://img.shields.io/npm/v/@r35007/mock-server-lite?label=npm)](https://img.shields.io/npm/v/@r35007/mock-server?label=npm) [![](https://img.shields.io/npm/l/@r35007/mock-server-lite?color=blue)](https://img.shields.io/npm/l/@r35007/mock-server?color=blue) [![](https://img.shields.io/npm/types/@r35007/mock-server-lite)](https://img.shields.io/npm/types/@r35007/mock-server)

Get a full REST API with **zero coding** in **less than 30 seconds** (seriously)

Created with <3 for front-end developers who need a quick back-end for prototyping and mocking.

This is the lite version of [MocK Server](https://r35007.github.io/Mock-Server).

**Note**: This lite version doesn't support db add, update, clone route in homepage, `fetch` related routeConfigs and helper middlewares like `_IterateResponse`, `_IterateRoutes` etc...

## Table of contents

- [Getting started](#getting-started)
- [Using JS Module](#using-js-module)
- [Route Config](#route-config)
  - [Set Delay Response](#set-delay-response)
  - [Set Custom StatusCode](#set-custom-statuscode)
  - [Add Middleware](#add-middleware)
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
- [Default Routes](#default-routes)
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
  "./injectors.json",
  "./middleware.js",
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
  "./injectors.json",
  "./middleware.js",
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
    "id": "id-unique", // sets a base64 encoded route
    "description": "", // Description about this Route.
    "delay": 2000, // in milliseconds
    "statusCode": 200, // in number between 100 to 600
    "middlewares": ["CustomLog"], // list of middleware names to be called
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
    message: "Retrieved Successfully",
    result: res.locals.data,
  };
  next();
};
```

`db.json`

```jsonc
{
  "/users/customMiddleware": {
    "_config": true,
    "description": "Note: This middleware must be available in the 'middleware.js' by the below given names. This 'DataWrapper' will be called on every hit of this route.",
    "mock": { "name": "foo" },
    "middlewares": ["DataWrapper"]
  }
}
```

Note: A middleware must be available at the name of the middlewares given in `db.json`
[http://localhost:3000/users/customMiddleware](http://localhost:3000/users/customMiddleware).

## **Injectors**

Injectors helps to inject a Route Configs explicitly.
This also helps to provide a common route configs.
Injector uses [`path-to-regexp`](https://github.com/pillarjs/path-to-regexp) pattern recognition to set config for multiple routes.

### **Inject Route Configs**

Here we are explicitly injecting `delay`, `middlewares`, `statusCode` to the `/posts` route.
You can any route configs to a specific or to a group of routes using Injectors.

- Injectors use `path-to-regexp` package for route pattern recognition.
- Click [path-to-regexp](https://www.npmjs.com/package/path-to-regexp) for more details.

example : `injectors.json`

```jsonc
[
  {
    "routes": ["/injectors/:id"],
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
    "routes": ["/injectors/2"],
    "override": true,
    "mock": "This data is injected using the injectors by matching the pattern '/injectors/2'."
  },
  {
    "routes": ["/injectors/:id"],
    "override": true,
    "exact": true,
    "statusCode": 200,
    "mock": "This data is injected using the injectors by exactly matching the route '/injectors/:id'."
  },
  {
    "routes": ["/(.*)"],
    "override": true,
    "middlewares": ["...", "CustomLog"]
  }
]
```

Note: Use `["..."]` If you want to add the existing middlewares.

### **Common Route Configs**

Using wildcards you can set a common route configs to all the routes.
`/(.*)` - matches all the routes.

For example :

`injectors.json`

```jsonc
[
  {
    "routes": ["/(.*)"],
    "description": "This Description is injected using the injectors. Set 'Override' flag to true to override the existing config values."
  },
  {
    "routes": ["/(.*)"],
    "override": true,
    "middlewares": ["...", "CustomLog"]
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

### **Local Store**

Local Store helps to store and share data between routes.
This can be accessed using `res.locals.getStore()` inside the middleware.

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
  "./injectors.json",
  "./middleware.js",
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

`res.locals` helps to access the current route config, `store` etc..
Here are the available options in `res.locals`

```ts
interface Locals {
  routePath: string;
  routeConfig: {
    _config?: boolean;
    id?: string;
    description?: string;
    mock?: any;
    store?: object;
    statusCode?: number;
    delay?: number;
    middlewares?: string[] | Array<express.RequestHandler>;
  };
  data: any; // response will be sent using this attribute value.
  config: Config; // gives you the current mock server configuration.
  getStore: () => object;
  getDb: () => object;
}
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
- `Reset Db` - [http://localhost:3000/\_reset/db](http://localhost:3000/_reset/db)
- `Reset Store` - [http://localhost:3000/\_reset/store](http://localhost:3000/_reset/store)

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
const mockServer = MockServer.Create();
await MockServer.Destroy();

// or
// pass a mock server instance to destroy
await MockServer.Destroy(mockServer);
```

### **launchServer**

It validates all the params in the MockServer, loads the resources and starts the server.

```js
mockServer.launchServer(
  "./db.json",
  "./injectors.json",
  "./middleware.js",
  "./rewriters.json",
  "./store.json"
);
```

**`Params`**

| Name       | Type            | Required | Description                                             |
| ---------- | --------------- | -------- | ------------------------------------------------------- |
| db         | string / object | No       | This object generates the local rest api.               |
| injectors  | string / object | No       | Helps to inject a route configs for the existing routes |
| middleware | string / object | No       | Here you initialize the needed custom middleware        |
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
  "./injectors.json",
  "./middleware.js",
  "./store.json"
);
app.use(resources);
```

**`Params`**

| Name       | Type            | Required | Description                                             |
| ---------- | --------------- | -------- | ------------------------------------------------------- |
| db         | string / object | No       | This object generates the local rest api.               |
| injectors  | string / object | No       | Helps to inject a route configs for the existing routes |
| middleware | string / object | No       | Here you initialize the needed custom middleware        |
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
mockServer.setMiddlewares(middlewares);
mockServer.setInjectors(injectors);
mockServer.setRewriters(rewriters);
mockServer.setStore(store);
mockServer.setDb(Db, { reverse });
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
const {
  getValidDb,
  getValidMiddlewares,
  getValidInjectors,
  getValidRewriters,
  getValidConfig,
  getValidStore,
  getValidRouteConfig,
} = require("@r35007/mock-server/dist/server/utils/validators");

const options = {
  reverse: true, // If true the db will be generated in reverse order
};

const rootPath = "./";

const db = getValidDb(
  "db.json", // db or HAR
  [], // injectors
  rootPath, // Root path to fetch the db.json file
  options
); // returns valid Db combined with the given injectors. Also helps to extract a db from HAR file. internally use getValidRouteConfig
const middleware = getValidMiddlewares(middlewares, rootPath); // returns a valid middleware along with the default middlewares
const injectors = getValidInjectors(injectors, rootPath); // returns a valid injectors. internally use getValidInjectorConfig
const rewriters = getValidRewriters(rewriters, rootPath); // returns a valid rewriters
const config = getValidConfig(config, rootPath); // returns a valid config combined with the default configs
const store = getValidStore(store, rootPath); // returns a valid store
const routeConfig = getValidRouteConfig(route, routeConfig); // returns a valid route config used by getValidDb
const injectorConfig = getValidInjectorConfig(route, routeConfig); // returns a valid injectorsConfig used by getValidInjectors
const route = getValidRoute(route); // splits route by comma and adds a slash ('/') prefix to the routes
```

## Author

**Sivaraman** - [sendmsg2siva.siva@gmail.com](sendmsg2siva.siva@gmail.com)

- _GitHub_ - [https://github.com/R35007/Mock-Server-Lite](https://github.com/R35007/Mock-Server-Lite)

## License

MIT
