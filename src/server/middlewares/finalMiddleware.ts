import { Locals } from '../types/common.types';

export default async (_req, res, _next) => {
  try {
    const locals = <Locals>res.locals;
    const routeConfig = locals.routeConfig

    if (!res.headersSent) {
      const status = routeConfig.statusCode;
      if (status && status >= 100 && status < 600) res.status(status);
      let response = locals.data !== undefined ? (locals.data ?? {}) : (locals.routeConfig.mock ?? {});
      response = (["object", "string", "boolean"].includes(typeof response)) ? response : `${response}`;
      typeof response === "object" ? res.jsonp(response) : res.send(response);
    }
  } catch (err) {
    res.send(err.message || '')
  }
}