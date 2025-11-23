import type { ApiResponse } from '../../lib/api.class';

export default (params: Record<string, any>): ApiResponse => {
	return {
		success: true,
		statusCode: 200,
		result: {
			message: 'POST teszt kacsa',
			params: params
		}
	};
};
