/** @format */

import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import makeWASocket, {
	DisconnectReason,
	useMultiFileAuthState,
	WASocket,
} from "baileys";
import { Boom } from "@hapi/boom";
import { BaileysLoggerAdapter } from "./baileys-logger.adapter";

@Injectable()
export class BaileysService implements OnModuleInit {
	private sock!: WASocket;

	private readonly logger = new Logger(BaileysService.name);

	async onModuleInit() {
		await this.initBaileys();
	}

	private async initBaileys() {
		const { state, saveCreds } =
			await useMultiFileAuthState("auth_info_baileys");

		const adaptedLogger = new BaileysLoggerAdapter(this.logger);
		this.sock = makeWASocket({ auth: state, logger: adaptedLogger });
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		this.sock.ev.on("creds.update", saveCreds);

		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		this.sock.ev.on("connection.update", async (update) => {
			const { connection, lastDisconnect, qr } = update;

			if (connection === "close") {
				const shouldReconnect =
					// eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
					(lastDisconnect?.error as Boom)?.output?.statusCode !==
					DisconnectReason.loggedOut;

				if (shouldReconnect) {
					this.logger.warn(
						"Connection unexpectedly closed. Creating a new socket",
					);
					await this.initBaileys();
				} else {
					this.logger.log(
						"Instance successfully logged out. Pair with code again",
					);
				}
			} else if (connection == "open" || !!qr) {
				const phoneNumber = "2349164187594";
				// your choice
				const code = await this.sock.requestPairingCode(phoneNumber);
				this.logger.log(`Pairing code: ${code}`);
			}
		});
	}
}
