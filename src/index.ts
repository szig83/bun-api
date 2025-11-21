import { Elysia } from 'elysia';
import Api, { type ApiContext } from './lib/api.class';

const app = new Elysia()
	.all('/*', async ({ params, query, body, request, set }) => {
		const context: ApiContext = {
			params,
			query,
			body,
			request,
			headers: Object.fromEntries(request.headers.entries()),
			set
		};

		const api = await new Api(context).loadEndpoint();

		set.status = api.responseCode;
		return api.getResponse();
	})
	.listen(3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
