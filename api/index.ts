import { handle } from 'hono/vercel';
import app from '../__create/index.ts';

export const config = {
  runtime: 'nodejs',
};

export default handle(app);
