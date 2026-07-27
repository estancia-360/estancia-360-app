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
import { AnimalClassesModule } from './modules/core/animal-classes/animal-classes.module';
import { SyncDeletionsModule } from './modules/core/sync-deletions/sync-deletions.module';
import { SubscriptionPlansModule } from './modules/payment-modules/subscription-plans/subscription-plans.module';
import { RanchSubscriptionsModule } from './modules/payment-modules/ranch-subscriptions/ranch-subscriptions.module';
import { SubscriptionPaymentsModule } from './modules/payment-modules/subscription-payments/subscription-payments.module';
import { RanchUsersModule } from './modules/ranch-management/ranch-users/ranch-users.module';
import { RanchesModule } from './modules/ranch-management/ranches/ranches.module';
import { RanchPasturesModule } from './modules/ranch-management/ranch-pastures/ranch-pastures.module';
import { RanchLotsModule } from './modules/ranch-management/ranch-lots/ranch-lots.module';
import { AnimalBreedsModule } from './modules/ranch-management/animal-breeds/animal-breeds.module';
import { AnimalStatusesModule } from './modules/ranch-management/animal-statuses/animal-statuses.module';
import { RanchAnimalsModule } from './modules/ranch-management/ranch-animals/ranch-animals.module';
import { AnimalEventsModule } from './modules/ranch-management/animal-events/animal-events.module';
import { BreedingServicesModule } from './modules/breeding-modules/breeding-services/breeding-services.module';
import { GestationDiagnosesModule } from './modules/breeding-modules/gestation-diagnoses/gestation-diagnoses.module';
import { ParturitionsModule } from './modules/breeding-modules/parturitions/parturitions.module';
import { WeaningsModule } from './modules/breeding-modules/weanings/weanings.module';
import { AnimalDeclaredHistoryModule } from './modules/breeding-modules/animal-declared-history/animal-declared-history.module';
import { WeightRecordsModule } from './modules/rearing-modules/weight-records/weight-records.module';
import { RearingSelectionsModule } from './modules/rearing-modules/rearing-selections/rearing-selections.module';
import { FatteningEntriesModule } from './modules/fattening-modules/fattening-entries/fattening-entries.module';
import { FeedRecordsModule } from './modules/fattening-modules/feed-records/feed-records.module';
import { VaccinationsModule } from './modules/health-modules/vaccinations/vaccinations.module';
import { TreatmentsModule } from './modules/health-modules/treatments/treatments.module';
import { HealthIncidentsModule } from './modules/health-modules/health-incidents/health-incidents.module';
import { MovementsModule } from './modules/movement-modules/movements/movements.module';
import { MovementAnimalsModule } from './modules/movement-modules/movement-animals/movement-animals.module';
import { AnimalExitsModule } from './modules/movement-modules/animal-exits/animal-exits.module';
import { AuthModule } from './app/auth/auth.module';
import { BreedingModule } from './app/breeding/breeding.module';
import { RearingModule } from './app/rearing/rearing.module';
import { FatteningModule } from './app/fattening/fattening.module';
import { AnimalHealthModule } from './app/animal-health/animal-health.module';
import { MovementsAppModule } from './app/movements/movements-app.module';
import { SubscriptionsModule } from './app/subscriptions/subscriptions.module';
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
        AnimalClassesModule,
        SyncDeletionsModule,
        // payment-modules
        SubscriptionPlansModule,
        RanchSubscriptionsModule,
        SubscriptionPaymentsModule,
        // ranch-management
        RanchUsersModule,
        RanchesModule,
        RanchPasturesModule,
        RanchLotsModule,
        AnimalBreedsModule,
        AnimalStatusesModule,
        RanchAnimalsModule,
        AnimalEventsModule,
        // breeding-modules
        BreedingServicesModule,
        GestationDiagnosesModule,
        ParturitionsModule,
        WeaningsModule,
        AnimalDeclaredHistoryModule,
        // rearing-modules / fattening-modules
        WeightRecordsModule,
        RearingSelectionsModule,
        FatteningEntriesModule,
        FeedRecordsModule,
        // health-modules
        VaccinationsModule,
        TreatmentsModule,
        HealthIncidentsModule,
        // movement-modules
        MovementsModule,
        MovementAnimalsModule,
        AnimalExitsModule,
        AuthModule,
        // app/ (orquestación)
        BreedingModule,
        RearingModule,
        FatteningModule,
        AnimalHealthModule,
        MovementsAppModule,
        SubscriptionsModule,
        MailerModule.register(),
    ],
})
export class AppModule {}
