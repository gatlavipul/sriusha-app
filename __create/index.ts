import { Hono } from 'hono';
import { createHonoServer } from 'react-router-hono-server/node';
import api from '../src/app/api/admin/[[...path]]/route';

const API_BASENAME = '/api';

const app = new Hono();

// Minimal middleware
app.use('*', async (c, next) => {
  console.log(`[Request] ${c.req.method} ${c.req.url}`);
  await next();
});

// Routes
app.route(API_BASENAME, api);

export default createHonoServer({ app });
