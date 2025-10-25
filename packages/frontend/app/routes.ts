import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/index.ts'),
  route('log-in', 'routes/log-in.tsx'),
  route('pianos', 'routes/pianos.tsx'),
  route('pianos/:id', 'routes/pianos.$id.tsx'),
  route('edit/pianos/:id', 'routes/edit.pianos.$id.tsx'),
  route('create/pianos', 'routes/create.pianos.tsx'),
] satisfies RouteConfig;
