import { Module } from '@nestjs/common';
import { MyConfigModule } from './infrastructure/config/config.module';
import { MyDatabaseModule } from './infrastructure/database/database.module';
import { UsersModule } from './modules/user-management/users/users.module';
import { AuthModule } from './app/auth/auth.module';
import { RolesModule } from './modules/core/roles/roles.module';
import { NotificationsModule } from './app/notifications/notifications.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EmailModule } from './shared/services/email/email.module';

@Module({
	imports: [
		EventEmitterModule.forRoot(),
		EmailModule,
		MyConfigModule,
		MyDatabaseModule,
		RolesModule,
		UsersModule,
		AuthModule,
		NotificationsModule,
	],
})
export class AppModule { }
