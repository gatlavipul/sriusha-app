import { Hono } from 'hono';
import type { Handler } from 'hono/types';
import updatedFetch from '../src/__create/fetch';

const API_BASENAME = '/api';
const api = new Hono();

if (globalThis.fetch) {
  globalThis.fetch = updatedFetch;
}

// Use Vite's import.meta.glob to eagerly load all route modules
// This ensures Vite resolves aliases like @/ properly
const routeModules = import.meta.glob<
  '../src/app/api/**/route.js',
  Record<string, unknown>
>('../src/app/api/**/route.js', {
  eager: true,
});

// Helper function to transform file path to Hono route path
function getHonoPath(routeFile: string): { name: string; pattern: string }[] {
  // Extract the path part after /api/ and before /route.js
  const match = routeFile.match(/\.\.\/src\/app\/api\/(.*)\/route\.js/);
  if (!match || !match[1]) {
    return [{ name: 'root', pattern: '' }];
  }
  const segments = match[1].split('/');
  const transformedParts = segments.map((segment) => {
    const paramMatch = segment.match(/^\[(\.{3})?([^\]]+)\]$/);
    if (paramMatch) {
      const [_, dots, param] = paramMatch;
      return dots === '...'
        ? { name: param, pattern: `:${param}{.+}` }
        : { name: param, pattern: `:${param}` };
    }
    return { name: segment, pattern: segment };
  });
  return transformedParts;
}

// Register all routes from the globbed modules
function registerRoutes() {
  // Clear existing routes
  api.routes = [];

  // Sort routes: longer paths first (more specific routes take priority)
  const sortedRoutes = Object.entries(routeModules).sort(
    (a, b) => b[0].length - a[0].length
  );

  for (const [routePath, route] of sortedRoutes) {
    try {
      const routeModule = route as Record<string, unknown>;
      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
      for (const method of methods) {
        try {
          if (routeModule[method]) {
            const parts = getHonoPath(routePath);
            const honoPath = `/${parts.map(({ pattern }) => pattern).join('/')}`;
            const handler: Handler = async (c) => {
              const params = c.req.param();
              return await (routeModule[method] as Function)(c.req.raw, { params });
            };
            const methodLowercase = method.toLowerCase();
            switch (methodLowercase) {
              case 'get':
                api.get(honoPath, handler);
                break;
              case 'post':
                api.post(honoPath, handler);
                break;
              case 'put':
                api.put(honoPath, handler);
                break;
              case 'delete':
                api.delete(honoPath, handler);
                break;
              case 'patch':
                api.patch(honoPath, handler);
                break;
              default:
                console.warn(`Unsupported method: ${method}`);
                break;
            }
          }
        } catch (error) {
          console.error(
            `Error registering route ${routePath} for method ${method}:`,
            error
          );
        }
      }
    } catch (error) {
      console.error(`Error processing route file ${routePath}:`, error);
    }
  }
}

// Initial route registration
registerRoutes();

// Hot reload routes in development
if (import.meta.env.DEV) {
  if (import.meta.hot) {
    import.meta.hot.accept((newSelf) => {
      registerRoutes();
    });
  }
}

export { api, API_BASENAME };
