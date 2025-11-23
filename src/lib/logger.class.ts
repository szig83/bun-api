import { appendFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';

export class Logger {
	private static logFile = 'logs/app.log';

	private static async ensureDirectory() {
		try {
			await mkdir(dirname(this.logFile), { recursive: true });
		} catch (error) {
			// Ignore if directory already exists
		}
	}

	private static async write(level: string, message: string, data?: any) {
		await this.ensureDirectory();
		const timestamp = new Date().toISOString();

		let dataString = '';
		if (data) {
			if (data instanceof Error) {
				dataString = JSON.stringify({ ...data, message: data.message, stack: data.stack });
			} else {
				dataString = JSON.stringify(data);
			}
		}

		const logEntry = `[${timestamp}] [${level}] ${message} ${dataString}\n`;

		try {
			await appendFile(this.logFile, logEntry);
		} catch (error) {
			console.error('Failed to write to log file:', error);
		}
	}

	static async info(message: string, data?: any) {
		await this.write('INFO', message, data);
	}

	static async error(message: string, data?: any) {
		await this.write('ERROR', message, data);
	}

	static async custom(level: string, message: string, data?: any) {
		await this.write(level.toUpperCase(), message, data);
	}
}
