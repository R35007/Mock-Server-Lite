import * as express from "express";
import * as UserTypes from './user.types';
import * as ValidTypes from './valid.types';

export type RoutePairs = { [key: string]: string }

export type Default_Options = Partial<Omit<ValidTypes.Config, 'port' | 'host' | 'root' | 'id' | 'reverse'>>

export type User_Middlweares = { [x: string]: express.RequestHandler | Array<express.RequestHandler> }
export type Global_Middlweares = { _globals?: express.RequestHandler | Array<express.RequestHandler> }
export type HarMiddleware = {
  _harEntryCallback?: (entry: HarEntry, routePath: string, routeConfig: UserTypes.RouteConfig) => { [key: string]: UserTypes.RouteConfig }
  _harDbCallback?: (data: string | UserTypes.Db | { [key: string]: Omit<Object, "__config"> | any[] | string } | HAR, dbFromHAR: UserTypes.Db) => UserTypes.Db
}
export type KibanaMiddleware = {
  _kibanaHitsCallback?: (hit: HIT, routePath: string, routeConfig: UserTypes.RouteConfig) => { [key: string]: UserTypes.RouteConfig }
  _kibanaDbCallback?: (data: string | UserTypes.Db | { [key: string]: Omit<Object, "__config"> | any[] | string } | HAR, dbFromKibana: UserTypes.Db) => UserTypes.Db
}

export type GetValidDbOptions = {
  reverse?: boolean,
}

export interface Locals {
  routePath: string;
  routeConfig: ValidTypes.RouteConfig;
  data: any;
  config: ValidTypes.Config;
  getStore: () => ValidTypes.Store;
  getDb: () => ValidTypes.Db;
}

export type HIT = {
  [key: string]: any;
  _source: {
    requestURI: string;
    response?: string;
    e2eRequestId?: string;
    session_id?: string;
    request: string;
    status_code: string;
  }
}

export type KIBANA = {
  rawResponse: {
    hits: { hits: HIT[] }
  }
}

export type HAR = {
  log: {
    [key: string]: any;
    entries: HarEntry[];
  };
}

export type HarEntry = {
  [key: string]: any;
  _resourceType: string;
  request: {
    [key: string]: any;
    url: string;
  };
  response: {
    [key: string]: any;
    status: number;
    content: {
      [key: string]: any;
      text: string;
    };
  };
}

export type PathDetails = {
  fileName: string;
  extension: string;
  filePath: string;
  isFile: boolean;
  isDirectory: boolean;
}

export type GetData = {
  db: ValidTypes.Db;
  middlewares: ValidTypes.Middlewares;
  injectors: ValidTypes.Injectors;
  rewriters: ValidTypes.Rewriters
  store: ValidTypes.Store;
  config: ValidTypes.Config;
}

