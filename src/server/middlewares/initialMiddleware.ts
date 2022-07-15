import express from "express";
import * as _ from "lodash";
import { Locals } from '../types/common.types';
import * as ValidTypes from '../types/valid.types';

export default (routePath: string, getDb: () => ValidTypes.Db, config: ValidTypes.Config, getStore: () => ValidTypes.Store) => {
  return async (_req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const routeConfig = getDb()[routePath];
      routeConfig.store && !_.isPlainObject(routeConfig.store) && (routeConfig.store = {});

      const locals = res.locals as Locals
      locals.routePath = routePath;
      locals.routeConfig = routeConfig;
      locals.getDb = getDb;
      locals.getStore = getStore;
      locals.config = config;

      locals.data = undefined;

      locals.data = routeConfig.mock;
      next();
    } catch (error) {
      console.error(error);
      next();
    }
  };
};
