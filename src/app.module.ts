import { Module } from '@nestjs/common';
import { MyConfigModule } from './infrastructure/config/config.module';
import { MyDatabaseModule } from './infrastructure/database/database.module';

@Module({
	imports: [
		MyConfigModule,
		MyDatabaseModule,
	],
})
export class AppModule { }
