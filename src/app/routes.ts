import {
  type RouteConfigEntry,
  index,
  route,
} from '@react-router/dev/routes';

const pages = import.meta.glob(['./**/page.jsx', '!./**/__*/**'], { eager: true });

const routes: RouteConfigEntry[] = Object.keys(pages).map((path) => {
  const relativePath = path.replace('./', '').replace('page.jsx', '');
  const routePath = relativePath
    .split('/')
    .filter(Boolean)
    .map((segment) => {
      if (segment.startsWith('[') && segment.endsWith(']')) {
        const paramName = segment.slice(1, -1);
        if (paramName.startsWith('...')) return '*';
        return `:${paramName}`;
      }
      return segment;
    })
    .join('/');

  if (routePath === '') {
    return index(path);
  }
  return route(routePath, path);
});

const notFound = route('*?', './__create/not-found.tsx');
export default [...routes, notFound];
