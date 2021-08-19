import { Locals } from '../model';

export default async (_req, res, _next) => {
  const locals = <Locals>res.locals;
  const routeConfig = locals.routeConfig
  if (!res.headersSent) {
    const status = routeConfig.statusCode;
    if (status && status >= 100 && status < 600) res.status(status);
    res.send(locals.data || {});
  }
}