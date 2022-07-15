import { Global_Middlweares, HarMiddleware, KibanaMiddleware, RoutePairs, User_Middlweares } from './common.types';
import * as UserTypes from "./user.types";

export type Config = {
  port: number;
  host: string;
  root: string;
  base: string;
  id: string;
  reverse: boolean;
  staticDir: string;
  noGzip: boolean;
  noCors: boolean;
  logger: boolean;
  readOnly: boolean;
  bodyParser: boolean;
};
export type Db = { [key: string]: RouteConfig }
export type Injectors = InjectorConfig[];
export type Middlewares = Global_Middlweares & HarMiddleware & KibanaMiddleware & User_Middlweares
export type Rewriters = RoutePairs;
export type Store = Object;

export type RouteConfig = UserTypes.RouteConfig & {
  id: string;
  middlewares?: UserTypes.Middleware_Config[]
}

export type InjectorConfig = {
  routes: string[];
  override?: boolean;
  exact?: boolean;
} & Partial<RouteConfig>;