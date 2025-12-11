/** @format */

import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { BaileysModule } from "./baileys/baileys.module";

@Module({
	imports: [BaileysModule],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
