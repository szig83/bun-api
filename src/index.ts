import { Elysia, type Context } from 'elysia';

const app = new Elysia()
	.get('/:id', async (context) => {
		return router(context);
	})
	.listen(3000);

const router = async (context: Context) => {
	const id = context.params.id;
	try {
		const idModule = await import(`./endpoints/${id}.get.ts`);
		if (idModule.default) {
			return idModule.default(context);
		}
	} catch (error) {
		return 'hiba van ám babám.';
	}
};

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
