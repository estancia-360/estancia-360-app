import { Module } from '@nestjs/common';
import { MyConfigModule } from './infrastructure/config/config.module';
import { MyDatabaseModule } from './infrastructure/database/database.module';
import { UsersModule } from './modules/user-management/users/users.module';
import { AuthModule } from './app/auth/auth.module';
import { RolesModule } from './modules/core/roles/roles.module';

@Module({
	imports: [
		MyConfigModule,
		MyDatabaseModule,
		RolesModule,
		UsersModule,
		AuthModule,
	],
})
export class AppModule { }
