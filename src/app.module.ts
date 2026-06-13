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
import { AnimalBreedsModule } from './modules/ranch-management/animal-breeds/animal-breeds.module';
import { AnimalStatusesModule } from './modules/ranch-management/animal-statuses/animal-statuses.module';
import { RanchAnimalsModule } from './modules/ranch-management/ranch-animals/ranch-animals.module';
import { ProductiveStatusesModule } from './modules/core/productive-statuses/productive-statuses.module';
import { RanchPasturesModule } from './modules/ranch-management/ranch-pastures/ranch-pastures.module';
import { RanchLotsModule } from './modules/ranch-management/ranch-lots/ranch-lots.module';
import { EventTypesModule } from './modules/core/event-types/event-types.module';
import { AnimalEventsModule } from './modules/ranch-management/animal-events/animal-events.module';
import { AnimalDeclaredHistoryModule } from './modules/breeding-modules/animal-declared-history/animal-declared-history.module';
import { BreedingServicesModule } from './modules/breeding-modules/breeding-services/breeding-services.module';
import { GestationDiagnosesModule } from './modules/breeding-modules/gestation-diagnoses/gestation-diagnoses.module';
import { ParturitionsModule } from './modules/breeding-modules/parturitions/parturitions.module';
import { WeaningsModule } from './modules/breeding-modules/weanings/weanings.module';
import { BreedingModule } from './app/breeding/breeding.module';
import { AnimalClassesModule } from './modules/core/animal-classes/animal-classes.module';
import { SyncModule } from './app/sync/sync.module';
import { WeightRecordsModule } from './modules/rearing-modules/weight-records/weight-records.module';
import { RearingSelectionsModule } from './modules/rearing-modules/rearing-selections/rearing-selections.module';
import { FatteningEntriesModule } from './modules/fattening-modules/fattening-entries/fattening-entries.module';
import { FeedRecordsModule } from './modules/fattening-modules/feed-records/feed-records.module';
import { RearingModule } from './app/rearing/rearing.module';
import { FatteningModule } from './app/fattening/fattening.module';
import { SyncDeletionsModule } from './modules/core/sync-deletions/sync-deletions.module';

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
		AnimalBreedsModule,
		AnimalStatusesModule,
		RanchAnimalsModule,
		ProductiveStatusesModule,
		RanchPasturesModule,
		RanchLotsModule,
		EventTypesModule,
		AnimalEventsModule,
		AnimalDeclaredHistoryModule,
		BreedingServicesModule,
		GestationDiagnosesModule,
		ParturitionsModule,
		WeaningsModule,
		BreedingModule,
		AnimalClassesModule,
		SyncModule,
		WeightRecordsModule,
		RearingSelectionsModule,
		FatteningEntriesModule,
		FeedRecordsModule,
		RearingModule,
		FatteningModule,
		SyncDeletionsModule,
	],
})
export class AppModule { }
