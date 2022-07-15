import * as express from "express";
import { Global_Middlweares, HarMiddleware, KibanaMiddleware, RoutePairs, User_Middlweares } from './common.types';
import * as ValidTypes from './valid.types';

export type Config = Partial<ValidTypes.Config>;
export type Db = { [key: string]: RouteConfig } | { [key: string]: Omit<Object, "_config"> | any[] | string };
export type Injectors = InjectorConfig[];
export type Middlewares = Partial<Global_Middlweares & HarMiddleware & KibanaMiddleware & User_Middlweares>
export type Rewriters = RoutePairs;
export type Store = Object;


export type Middleware_Config = express.RequestHandler |  string;
export type RouteConfig = {
  id?: string | number;
  _config: boolean;
  description?: string;
  mock?: any;
  store?: object;
  statusCode?: number;
  delay?: number;
  middlewares?: Middleware_Config | Middleware_Config[];
}

export type InjectorConfig = {
  routes: string | string[];
  override?: boolean;
  exact?: boolean;
} & Partial<RouteConfig>;