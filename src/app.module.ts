import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { HealthModule } from './app/health/health.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/user-management/users/users.module';
import { RolesModule } from './modules/core/roles/roles.module';
import { CountriesModule } from './modules/core/countries/countries.module';
import { RegionsModule } from './modules/core/regions/regions.module';
import { CitiesModule } from './modules/core/cities/cities.module';
import { ProductionTypesModule } from './modules/core/production-types/production-types.module';
import { RanchRolesModule } from './modules/core/ranch-roles/ranch-roles.module';
import { SubscriptionPlansModule } from './modules/payment-modules/subscription-plans/subscription-plans.module';
import { RanchSubscriptionsModule } from './modules/payment-modules/ranch-subscriptions/ranch-subscriptions.module';
import { RanchUsersModule } from './modules/ranch-management/ranch-users/ranch-users.module';
import { RanchesModule } from './modules/ranch-management/ranches/ranches.module';
import { AuthModule } from './app/auth/auth.module';
import { MailerModule } from './plugins/mailer/mailer.module';

@Module({
    imports: [
        AppConfigModule,
        HealthModule,
        DatabaseModule,
        // core
        UsersModule,
        RolesModule,
        CountriesModule,
        RegionsModule,
        CitiesModule,
        ProductionTypesModule,
        RanchRolesModule,
        // payment-modules (slice mínimo — ver nota en ranch-subscriptions)
        SubscriptionPlansModule,
        RanchSubscriptionsModule,
        // ranch-management
        RanchUsersModule,
        RanchesModule,
        AuthModule,
        MailerModule.register(),
    ],
})
export class AppModule {}
