import express from "express";
import * as _ from "lodash";
import { Config, Db, Locals } from '../model';

export default (routePath: string, db: Db, getDb: (ids?: string[], routePaths?: string[]) => Db, config: Config, store: object) => {
  return async (_req: express.Request, res: express.Response, next: express.NextFunction) => {

    const routeConfig = db[routePath];
    routeConfig.store && !_.isPlainObject(routeConfig.store) && (routeConfig.store = {});

    const locals = res.locals as Locals
    locals.routePath = routePath;
    locals.routeConfig = routeConfig;
    locals.getDb = getDb;
    locals.store = store;
    locals.config = _.cloneDeep(config);
    locals.data = routeConfig.mock;

    next();
  };
};