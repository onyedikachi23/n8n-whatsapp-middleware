/** @format */

import { Logger } from "@nestjs/common";
import { ILogger } from "baileys/lib/Utils/logger";

const format = (
	obj: unknown,
	msg?: string,
	bindings?: Record<string, unknown>,
): string => {
	const bindingString =
		bindings && Object.keys(bindings).length > 0
			? `[${Object.entries(bindings)
					.map(([k, v]) => `${k}=${String(v)}`)
					.join(", ")}] `
			: "";
	return `${bindingString}${msg || ""} ${typeof obj === "object" && obj !== null ? JSON.stringify(obj) : String(obj)}`.trim();
};

export class BaileysLoggerAdapter implements ILogger {
	public level: string = "verbose"; // Default level, can be overridden if Baileys uses it

	constructor(
		private readonly nestLogger: Logger,
		private readonly currentBindings: Record<string, unknown> = {},
	) {}

	child(obj: Record<string, unknown>): ILogger {
		const newBindings = { ...this.currentBindings, ...obj };
		return new BaileysLoggerAdapter(this.nestLogger, newBindings);
	}

	trace(obj: unknown, msg?: string): void {
		this.nestLogger.verbose(format(obj, msg, this.currentBindings));
	}

	debug(obj: unknown, msg?: string): void {
		this.nestLogger.debug(format(obj, msg, this.currentBindings));
	}

	info(obj: unknown, msg?: string): void {
		this.nestLogger.log(format(obj, msg, this.currentBindings)); // 'info' -> 'log'
	}

	warn(obj: unknown, msg?: string): void {
		this.nestLogger.warn(format(obj, msg, this.currentBindings));
	}

	error(obj: unknown, msg?: string): void {
		const message = format(obj, msg, this.currentBindings);
		const stack = obj instanceof Error ? obj.stack : undefined;
		this.nestLogger.error(message, stack);
	}
}
