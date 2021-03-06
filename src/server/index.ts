import chalk from "chalk";
import express from "express";
import { Server } from "http";
import * as _ from 'lodash';
import enableDestroy from 'server-destroy';
import { GettersSetters } from './getters-setters';
import Defaults from './middlewares/defaults';
import Delay from './middlewares/delay';
import ErrorHandler from './middlewares/errorHandler';
import FinalMiddleware from './middlewares/finalMiddleware';
import InitialMiddleware from './middlewares/initialMiddleware';
import PageNotFound from './middlewares/pageNotFound';
import Rewriter from './middlewares/rewriter';
import { } from "./types/common.types";
import * as ParamTypes from "./types/param.types";
import * as UserTypes from "./types/user.types";
import * as ValidTypes from "./types/valid.types";
import { cleanDb } from './utils';
import { getValidDb } from './utils/validators';

export class MockServer extends GettersSetters {

  static #mockServer: MockServer | undefined;
  constructor(config?: ParamTypes.Config) { super(config) }

  static Create = (config?: ParamTypes.Config) => {
    if (!MockServer.#mockServer) {
      MockServer.#mockServer = new MockServer(config);
      return MockServer.#mockServer;
    } else {
      MockServer.#mockServer?.setConfig(config);
      return MockServer.#mockServer;
    }
  }

  static Destroy = async (mockServer?: MockServer) => {
    if (mockServer) {
      try { await mockServer.stopServer() } catch (err) { console.log(err) }
      mockServer.resetServer();
      return undefined;
    } else {
      try { await MockServer.#mockServer?.stopServer() } catch (err) { console.log(err) }
      MockServer.#mockServer?.resetServer();
      MockServer.#mockServer = undefined;
      return undefined;
    }
  }

  launchServer = async (
    db?: ParamTypes.Db,
    injectors?: ParamTypes.Injectors,
    middlewares?: ParamTypes.Middlewares,
    rewriters?: ParamTypes.Rewriters,
    store?: ParamTypes.Store
  ): Promise<Server | undefined> => {
    const app = this.app;

    const rewriter = this.rewriter(rewriters);
    app.use(rewriter);

    const defaults = this.defaults();
    app.use(defaults);

    const resources = this.resources(db, injectors, middlewares, store);
    this.middlewares._globals && app.use(this.middlewares._globals);
    app.use(this.config.base, resources);

    const defaultRoutes = this.defaultRoutes();
    app.use(this.config.base, defaultRoutes);

    app.use(this.pageNotFound);
    app.use(this.errorHandler);

    return await this.startServer();
  };

  defaults = (options?: UserTypes.Config) => {
    options && this.setConfig({ ...this.config, ...options });
    return Defaults(this.config);
  }

  rewriter = (rewriters?: ParamTypes.Rewriters) => {
    rewriters && this.setRewriters(rewriters);
    return Rewriter(this.rewriters);
  }

  resources = (
    db?: ParamTypes.Db,
    injectors?: ParamTypes.Injectors,
    middlewares?: ParamTypes.Middlewares,
    store?: ParamTypes.Store,
  ) => {

    !_.isEmpty(middlewares) && this.setMiddlewares(middlewares);
    !_.isEmpty(injectors) && this.setInjectors(injectors);
    !_.isEmpty(store) && this.setStore(store);
    !_.isEmpty(db) && this.setDb(db);

    console.log("\n" + chalk.gray("Loading Resources..."));

    this.router = express.Router();
    Object.entries(this._db()).forEach(([routePath, routeConfig]: [string, ValidTypes.RouteConfig]) =>
      this.#createRoute(routePath, routeConfig, this.router)
    );

    console.log(chalk.gray("Done."));
    return this.router;
  };

  #createRoute = (routePath: string, routeConfig: ValidTypes.RouteConfig, router: express.Router) => {
    if (!this.routes.includes(routePath)) {
      this.routes.push(routePath);
      const middlewareList = this.#getMiddlewareList(routePath, routeConfig);

      // adding new Routes
      if (!Object.keys(this._db()).includes(routePath)) {
        this._db()[routePath] = routeConfig;
      }

      router?.all(routePath, middlewareList);
    };
  }

  addDbData = (db: UserTypes.Db, router: express.Router = this.router) => {
    const config = this.config;
    const validDb = getValidDb(db, this.injectors, config.root, { reverse: config.reverse });
    if (!this.router) this.router = express.Router();
    Object.entries(validDb).forEach(([routePath, routeConfig]: [string, ValidTypes.RouteConfig]) =>
      this.#createRoute(routePath, routeConfig, router)
    );
  }

  #getMiddlewareList = (routePath: string, routeConfig: ValidTypes.RouteConfig) => {
    const middlewares = (routeConfig.middlewares || [])
      .map(middleware => _.isString(middleware) ? this.middlewares[middleware] : middleware)
      .filter(_.isFunction)
    return [
      InitialMiddleware(routePath, this._db, this.config, this._store),
      Delay,
      ...middlewares,
      FinalMiddleware
    ];
  }

  startServer = (port?: number, host?: string): Promise<Server | undefined> => {
    (port || host) && this.setConfig({ ...this.config, port, host });
    const { port: _port, host: _host, base: _base } = this.config;

    console.log("\n" + chalk.gray("Starting Server..."));
    return new Promise((resolve, reject) => {

      if (this.server) {
        const { port } = this.server.address() as { address: string; family: string; port: number; };
        console.log("\nServer already listening to port : " + port);
        return reject(new Error("Server already listening to port : " + port));
      }

      this.server = this.app.listen(_port, _host, () => {
        console.log(chalk.green.bold("Mock Server Started."));

        console.log("\nHome");
        console.log(`http://${_host}:${_port}/${_base}`);

        console.log(chalk.gray("listening...") + "\n");

        enableDestroy(this.server!); // Enhance with a destroy function
        resolve(this.server!);
      }).on("error", (err) => {
        console.error("\nServer Error : " + err.message);
        reject(err);
      })
    })
  };

  stopServer = (): Promise<boolean> => {
    console.log("\n" + chalk.gray("Stopping Server..."));
    return new Promise((resolve, reject) => {

      if (!this.server) {
        console.error("\nNo Server to Stop");
        return reject(new Error("No Server to Stop"));
      }

      this.server.destroy((err) => {
        if (err) {
          console.error("\nServer Error : " + err.message);
          return reject(err);
        }
        console.log(chalk.gray("Mock Server Stopped"));
        this.server = undefined;
        resolve(true);
      })
    })
  };

  resetServer = this.init;

  pageNotFound = PageNotFound;

  errorHandler = ErrorHandler;

  defaultRoutes = () => {
    const router = express.Router();
    const defaultRoutes: Array<[string, express.RequestHandler]> = [
      ["/_db/:id?", (req: express.Request, res: express.Response) => this.#getDb(req, res)],
      ["/_rewriters", (_req, res) => res.send(this.rewriters)],
      ["/_store", (_req, res) => res.send(this.store)],
    ]

    defaultRoutes.forEach(([routePath, middleware]) => {
      if (!this.routes.includes(routePath)) {
        router.all(routePath, middleware);
        this.routes.push(routePath);
      }
    })

    return router;
  }

  #getDb = (req: express.Request, res: express.Response) => {
    const id = req.params.id;
    const findById = (id) => {
      const dbById = Object.entries(this.db).find(([_routePath, routeConfig]) => routeConfig.id === id);
      if (_.isEmpty(dbById)) return {};
      return { [dbById![0]]: dbById![1] }
    }
    const db = id ? findById(id) : this.db;
    if (req.query._clean) cleanDb(db);
    res.send(db);
  }
}