import { handle } from 'hono/netlify';
import { app } from '../__create/index';

export const handler = handle(app);
