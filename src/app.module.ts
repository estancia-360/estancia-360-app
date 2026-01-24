import { Module } from '@nestjs/common';
import { MyConfigModule } from './infrastructure/config/config.module';
import { MyDatabaseModule } from './infrastructure/database/database.module';
import { UsersModule } from './modules/user-management/users/users.module';
import { AuthModule } from './app/auth/auth.module';
import { RolesModule } from './modules/core/roles/roles.module';
import { NotificationsModule } from './app/notifications/notifications.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EmailModule } from './shared/services/email/email.module';
import { CountriesModule } from './modules/core/countries/countries.module';
import { RegionsModule } from './modules/core/regions/regions.module';
import { CitiesModule } from './modules/core/cities/cities.module';
import { ProductionTypesModule } from './modules/core/production-types/production-types.module';
import { RanchesModule } from './modules/ranch-management/ranches/ranches.module';
import { RanchUsersModule } from './modules/ranch-management/ranch-users/ranch-users.module';
import { RanchRolesModule } from './modules/core/ranch-roles/ranch-roles.module';

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
		CountriesModule,
		RegionsModule,
		CitiesModule,
		ProductionTypesModule,
		RanchesModule,
		RanchUsersModule,
		RanchRolesModule,
	],
})
export class AppModule { }
