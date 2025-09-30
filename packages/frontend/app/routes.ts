import {type RouteConfig, index, route} from '@react-router/dev/routes';

export default [
	index("routes/index.tsx"),
	route('pianos/:id', 'routes/pianos.$id.tsx'),
] satisfies RouteConfig;
