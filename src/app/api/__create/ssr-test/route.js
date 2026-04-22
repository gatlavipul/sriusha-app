import { getToken } from '@auth/core/jwt';
import React from 'react';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { renderToString } from 'react-dom/server';
import routes from '../../../routes';
import { serializeError } from 'serialize-error';
import cleanStack from 'clean-stack';

function serializeClean(err) {
	const serialized = serializeError(err);
	if (serialized.stack) {
		serialized.stack = cleanStack(serialized.stack, {
			pathFilter: (path) => {
				// Filter out paths that are not relevant to the error
				return (
					!path.includes('node_modules') &&
					!path.includes('dist') &&
					!path.includes('__create')
				);
			},
		});
	}

	return serialized;
}
const getHTMLOrError = (component) => {
	try {
		const html = renderToString(React.createElement(component, {}));
		return { html, error: null };
	} catch (error) {
		return { html: null, error: serializeClean(error) };
	}
};
export async function GET(request) {
	const results = await Promise.allSettled(
		routes.map(async (route) => {
			let component = null;
			try {
				const filePath = path.resolve(process.cwd(), 'src/app', route.file);
				const response = await import(/* @vite-ignore */ pathToFileURL(filePath).href);
				component = response.default;
			} catch (error) {
				console.debug('Error importing component:', route.file, error);
			}
			if (!component) {
				return null;
			}
			const rendered = getHTMLOrError(component);
			return {
				route: route.file,
				path: route.path,
				...rendered,
			};
		})
	);
	const cleanedResults = results.reduce((acc, result) => {
		if (result.status === 'fulfilled' && result.value) {
			acc.push(result.value);
		}
		return acc;
	}, []);

	return Response.json({ results: cleanedResults });
}
