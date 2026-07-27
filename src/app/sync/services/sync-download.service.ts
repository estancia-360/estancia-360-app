import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { RanchPasture } from 'src/modules/ranch-management/ranch-pastures/entities/ranch-pasture.entity';
import { RanchLot } from 'src/modules/ranch-management/ranch-lots/entities/ranch-lot.entity';
import { RanchAnimal } from 'src/modules/ranch-management/ranch-animals/entities/ranch-animal.entity';
import { AnimalEvent } from 'src/modules/ranch-management/animal-events/entities/animal-event.entity';
import { BreedingService } from 'src/modules/breeding-modules/breeding-services/entities/breeding-service.entity';
import { GestationDiagnosis } from 'src/modules/breeding-modules/gestation-diagnoses/entities/gestation-diagnosis.entity';
import { Parturition } from 'src/modules/breeding-modules/parturitions/entities/parturition.entity';
import { Weaning } from 'src/modules/breeding-modules/weanings/entities/weaning.entity';
import { AnimalDeclaredHistory } from 'src/modules/breeding-modules/animal-declared-history/entities/animal-declared-history.entity';
import { WeightRecord } from 'src/modules/rearing-modules/weight-records/entities/weight-record.entity';
import { RearingSelection } from 'src/modules/rearing-modules/rearing-selections/entities/rearing-selection.entity';
import { FatteningEntry } from 'src/modules/fattening-modules/fattening-entries/entities/fattening-entry.entity';
import { FeedRecord } from 'src/modules/fattening-modules/feed-records/entities/feed-record.entity';
import { Vaccination } from 'src/modules/health-modules/vaccinations/entities/vaccination.entity';
import { Treatment } from 'src/modules/health-modules/treatments/entities/treatment.entity';
import { HealthIncident } from 'src/modules/health-modules/health-incidents/entities/health-incident.entity';
import { Movement } from 'src/modules/movement-modules/movements/entities/movement.entity';
import { MovementAnimal } from 'src/modules/movement-modules/movement-animals/entities/movement-animal.entity';
import { AnimalExit } from 'src/modules/movement-modules/animal-exits/entities/animal-exit.entity';

import { AnimalClass } from 'src/modules/core/animal-classes/entities/animal-class.entity';
import { AnimalBreed } from 'src/modules/ranch-management/animal-breeds/entities/animal-breed.entity';
import { AnimalStatus } from 'src/modules/ranch-management/animal-statuses/entities/animal-status.entity';
import { EventType } from 'src/modules/core/event-types/entities/event-type.entity';
import { ProductiveStatus } from 'src/modules/core/productive-statuses/entities/productive-status.entity';
import { ProductionType } from 'src/modules/core/production-types/entities/production-type.entity';

import { SyncDeletionsService } from 'src/modules/core/sync-deletions/services/sync-deletions.service';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';

import {
    RanchPastureSyncDto,
    RanchLotSyncDto,
    RanchAnimalSyncDto,
    AnimalEventSyncDto,
    BreedingServiceSyncDto,
    GestationDiagnosisSyncDto,
    ParturitionSyncDto,
    WeaningSyncDto,
    AnimalDeclaredHistorySyncDto,
    WeightRecordSyncDto,
    RearingSelectionSyncDto,
    FatteningEntrySyncDto,
    FeedRecordSyncDto,
    VaccinationSyncDto,
    TreatmentSyncDto,
    HealthIncidentSyncDto,
    MovementSyncDto,
    MovementAnimalSyncDto,
    AnimalExitSyncDto,
} from '../dto/outputs/sync-download-entities.dto';
import {
    AnimalClassCatalogDto,
    AnimalBreedCatalogDto,
    AnimalStatusCatalogDto,
    EventTypeCatalogDto,
    ProductiveStatusCatalogDto,
    ProductionTypeCatalogDto,
    SyncCatalogsResponseDto,
} from '../dto/outputs/sync-catalogs-response.dto';
import { SyncDownloadResponseDto, SyncDownloadEntitiesDto } from '../dto/outputs/sync-download-response.dto';
import { SyncRanchDto } from '../dto/outputs/sync-ranches-response.dto';

const DEFAULT_LIMIT = 200;

type CursorMap = Record<string, number>;

interface TableConfig {
    key: keyof SyncDownloadEntitiesDto;
    table: string;
    alias: string;
    repo: Repository<any>;
    dto: any;
    applyRanchFilter: (qb: SelectQueryBuilder<any>, idRanch: number) => void;
}

@Injectable()
export class SyncDownloadService {
    constructor(
        @InjectRepository(RanchPasture) private readonly ranchPasturesRepo: Repository<RanchPasture>,
        @InjectRepository(RanchLot) private readonly ranchLotsRepo: Repository<RanchLot>,
        @InjectRepository(RanchAnimal) private readonly ranchAnimalsRepo: Repository<RanchAnimal>,
        @InjectRepository(AnimalEvent) private readonly animalEventsRepo: Repository<AnimalEvent>,
        @InjectRepository(BreedingService) private readonly breedingServicesRepo: Repository<BreedingService>,
        @InjectRepository(GestationDiagnosis) private readonly gestationDiagnosesRepo: Repository<GestationDiagnosis>,
        @InjectRepository(Parturition) private readonly parturitionsRepo: Repository<Parturition>,
        @InjectRepository(Weaning) private readonly weaningsRepo: Repository<Weaning>,
        @InjectRepository(AnimalDeclaredHistory) private readonly animalDeclaredHistoriesRepo: Repository<AnimalDeclaredHistory>,
        @InjectRepository(WeightRecord) private readonly weightRecordsRepo: Repository<WeightRecord>,
        @InjectRepository(RearingSelection) private readonly rearingSelectionsRepo: Repository<RearingSelection>,
        @InjectRepository(FatteningEntry) private readonly fatteningEntriesRepo: Repository<FatteningEntry>,
        @InjectRepository(FeedRecord) private readonly feedRecordsRepo: Repository<FeedRecord>,
        @InjectRepository(Vaccination) private readonly vaccinationsRepo: Repository<Vaccination>,
        @InjectRepository(Treatment) private readonly treatmentsRepo: Repository<Treatment>,
        @InjectRepository(HealthIncident) private readonly healthIncidentsRepo: Repository<HealthIncident>,
        @InjectRepository(Movement) private readonly movementsRepo: Repository<Movement>,
        @InjectRepository(MovementAnimal) private readonly movementAnimalsRepo: Repository<MovementAnimal>,
        @InjectRepository(AnimalExit) private readonly animalExitsRepo: Repository<AnimalExit>,

        @InjectRepository(AnimalClass) private readonly animalClassesRepo: Repository<AnimalClass>,
        @InjectRepository(AnimalBreed) private readonly animalBreedsRepo: Repository<AnimalBreed>,
        @InjectRepository(AnimalStatus) private readonly animalStatusesRepo: Repository<AnimalStatus>,
        @InjectRepository(EventType) private readonly eventTypesRepo: Repository<EventType>,
        @InjectRepository(ProductiveStatus) private readonly productiveStatusesRepo: Repository<ProductiveStatus>,
        @InjectRepository(ProductionType) private readonly productionTypesRepo: Repository<ProductionType>,

        private readonly syncDeletionsService: SyncDeletionsService,
        private readonly ranchUsersService: RanchUsersService,
    ) {}

    async getRanchesForUser(idUser: number): Promise<SyncRanchDto[]> {
        const ranchUsers = await this.ranchUsersService.findEntitiesByUser(idUser);
        return ranchUsers.map((ru) =>
            plainToInstance(
                SyncRanchDto,
                { idRanch: ru.idRanch, name: ru.ranch.name, idRanchRole: ru.idRole, ranchRoleName: ru.role.name },
                { excludeExtraneousValues: true },
            ),
        );
    }

    async assertRanchAccess(idUser: number, idRanch: number): Promise<void> {
        const ranchUser = await this.ranchUsersService.findOne(idUser, idRanch);
        if (!ranchUser) {
            throw new ForbiddenException({ message: 'User does not have access to this ranch.', error: 'RANCH_ACCESS_DENIED' });
        }
    }

    async getCatalogs(): Promise<SyncCatalogsResponseDto> {
        const [animalClasses, animalBreeds, animalStatuses, eventTypes, productiveStatuses, productionTypes] = await Promise.all([
            this.animalClassesRepo.find(),
            this.animalBreedsRepo.find(),
            this.animalStatusesRepo.find(),
            this.eventTypesRepo.find(),
            this.productiveStatusesRepo.find(),
            this.productionTypesRepo.find(),
        ]);

        return {
            animalClasses: plainToInstance(AnimalClassCatalogDto, animalClasses, { excludeExtraneousValues: true }),
            animalBreeds: plainToInstance(AnimalBreedCatalogDto, animalBreeds, { excludeExtraneousValues: true }),
            animalStatuses: plainToInstance(AnimalStatusCatalogDto, animalStatuses, { excludeExtraneousValues: true }),
            eventTypes: plainToInstance(EventTypeCatalogDto, eventTypes, { excludeExtraneousValues: true }),
            productiveStatuses: plainToInstance(ProductiveStatusCatalogDto, productiveStatuses, { excludeExtraneousValues: true }),
            productionTypes: plainToInstance(ProductionTypeCatalogDto, productionTypes, { excludeExtraneousValues: true }),
        };
    }

    async download(idRanch: number, since?: Date, cursor?: string, limit: number = DEFAULT_LIMIT): Promise<SyncDownloadResponseDto> {
        const serverTime = new Date();
        const cursorMap = this.decodeCursor(cursor);
        const nextCursorMap: CursorMap = {};

        const tables = this.buildTableConfigs();

        const entities = {} as SyncDownloadEntitiesDto;
        let anyHasMore = false;
        for (const config of tables) {
            const cursorId = cursorMap[config.table] ?? 0;
            const { rows, hasMore } = await this.fetchPage(config, idRanch, since, cursorId, limit);
            entities[config.key] = plainToInstance(config.dto, rows, { excludeExtraneousValues: true }) as any;
            if (hasMore) {
                anyHasMore = true;
                nextCursorMap[config.table] = Number(rows[rows.length - 1].id);
            } else if (rows.length > 0) {
                nextCursorMap[config.table] = Number(rows[rows.length - 1].id);
            } else if (cursorId > 0) {
                nextCursorMap[config.table] = cursorId;
            }
        }

        const deletions = await this.syncDeletionsService.findSince(idRanch, since);

        return {
            serverTime: serverTime.toISOString(),
            nextCursor: anyHasMore ? this.encodeCursor(nextCursorMap) : null,
            entities,
            deletions,
        };
    }

    private async fetchPage(
        config: TableConfig,
        idRanch: number,
        since: Date | undefined,
        cursorId: number,
        limit: number,
    ): Promise<{ rows: any[]; hasMore: boolean }> {
        const qb = config.repo.createQueryBuilder(config.alias);
        config.applyRanchFilter(qb, idRanch);
        qb.andWhere(`${config.alias}.id > :cursorId`, { cursorId });
        if (since) qb.andWhere(`${config.alias}.updatedAt > :since`, { since });
        qb.orderBy(`${config.alias}.id`, 'ASC').take(limit + 1);

        const rows = await qb.getMany();
        const hasMore = rows.length > limit;
        if (hasMore) rows.pop();
        return { rows, hasMore };
    }

    private buildTableConfigs(): TableConfig[] {
        return [
            {
                key: 'ranchPastures',
                table: 'ranch_pastures',
                alias: 'rp',
                repo: this.ranchPasturesRepo,
                dto: RanchPastureSyncDto,
                applyRanchFilter: (qb, idRanch) => qb.where('rp.idRanch = :idRanch', { idRanch }),
            },
            {
                key: 'ranchLots',
                table: 'ranch_lots',
                alias: 'rl',
                repo: this.ranchLotsRepo,
                dto: RanchLotSyncDto,
                applyRanchFilter: (qb, idRanch) => qb.where('rl.idRanch = :idRanch', { idRanch }),
            },
            {
                key: 'ranchAnimals',
                table: 'ranch_animals',
                alias: 'ra',
                repo: this.ranchAnimalsRepo,
                dto: RanchAnimalSyncDto,
                applyRanchFilter: (qb, idRanch) => qb.where('ra.idRanch = :idRanch', { idRanch }),
            },
            {
                key: 'animalEvents',
                table: 'animal_events',
                alias: 'ae',
                repo: this.animalEventsRepo,
                dto: AnimalEventSyncDto,
                applyRanchFilter: (qb, idRanch) => qb.innerJoin(RanchAnimal, 'ra', 'ra.id = ae.idRanchAnimal').where('ra.idRanch = :idRanch', { idRanch }),
            },
            {
                key: 'breedingServices',
                table: 'breeding_services',
                alias: 'bs',
                repo: this.breedingServicesRepo,
                dto: BreedingServiceSyncDto,
                applyRanchFilter: (qb, idRanch) =>
                    qb.innerJoin(AnimalEvent, 'ae', 'ae.id = bs.idEvent').innerJoin(RanchAnimal, 'ra', 'ra.id = ae.idRanchAnimal').where('ra.idRanch = :idRanch', { idRanch }),
            },
            {
                key: 'gestationDiagnoses',
                table: 'gestation_diagnoses',
                alias: 'gd',
                repo: this.gestationDiagnosesRepo,
                dto: GestationDiagnosisSyncDto,
                applyRanchFilter: (qb, idRanch) =>
                    qb.innerJoin(AnimalEvent, 'ae', 'ae.id = gd.idEvent').innerJoin(RanchAnimal, 'ra', 'ra.id = ae.idRanchAnimal').where('ra.idRanch = :idRanch', { idRanch }),
            },
            {
                key: 'parturitions',
                table: 'parturitions',
                alias: 'p',
                repo: this.parturitionsRepo,
                dto: ParturitionSyncDto,
                applyRanchFilter: (qb, idRanch) =>
                    qb.innerJoin(AnimalEvent, 'ae', 'ae.id = p.idEvent').innerJoin(RanchAnimal, 'ra', 'ra.id = ae.idRanchAnimal').where('ra.idRanch = :idRanch', { idRanch }),
            },
            {
                key: 'weanings',
                table: 'weanings',
                alias: 'w',
                repo: this.weaningsRepo,
                dto: WeaningSyncDto,
                applyRanchFilter: (qb, idRanch) =>
                    qb.innerJoin(AnimalEvent, 'ae', 'ae.id = w.idEvent').innerJoin(RanchAnimal, 'ra', 'ra.id = ae.idRanchAnimal').where('ra.idRanch = :idRanch', { idRanch }),
            },
            {
                key: 'animalDeclaredHistories',
                table: 'animal_declared_history',
                alias: 'h',
                repo: this.animalDeclaredHistoriesRepo,
                dto: AnimalDeclaredHistorySyncDto,
                applyRanchFilter: (qb, idRanch) => qb.innerJoin(RanchAnimal, 'ra', 'ra.id = h.idRanchAnimal').where('ra.idRanch = :idRanch', { idRanch }),
            },
            {
                key: 'weightRecords',
                table: 'weight_records',
                alias: 'wr',
                repo: this.weightRecordsRepo,
                dto: WeightRecordSyncDto,
                applyRanchFilter: (qb, idRanch) =>
                    qb.innerJoin(AnimalEvent, 'ae', 'ae.id = wr.idEvent').innerJoin(RanchAnimal, 'ra', 'ra.id = ae.idRanchAnimal').where('ra.idRanch = :idRanch', { idRanch }),
            },
            {
                key: 'rearingSelections',
                table: 'rearing_selections',
                alias: 'rs',
                repo: this.rearingSelectionsRepo,
                dto: RearingSelectionSyncDto,
                applyRanchFilter: (qb, idRanch) =>
                    qb.innerJoin(AnimalEvent, 'ae', 'ae.id = rs.idEvent').innerJoin(RanchAnimal, 'ra', 'ra.id = ae.idRanchAnimal').where('ra.idRanch = :idRanch', { idRanch }),
            },
            {
                key: 'fatteningEntries',
                table: 'fattening_entries',
                alias: 'fe',
                repo: this.fatteningEntriesRepo,
                dto: FatteningEntrySyncDto,
                applyRanchFilter: (qb, idRanch) =>
                    qb.innerJoin(AnimalEvent, 'ae', 'ae.id = fe.idEvent').innerJoin(RanchAnimal, 'ra', 'ra.id = ae.idRanchAnimal').where('ra.idRanch = :idRanch', { idRanch }),
            },
            {
                key: 'feedRecords',
                table: 'feed_records',
                alias: 'fr',
                repo: this.feedRecordsRepo,
                dto: FeedRecordSyncDto,
                applyRanchFilter: (qb, idRanch) => qb.innerJoin(RanchLot, 'rl', 'rl.id = fr.idLot').where('rl.idRanch = :idRanch', { idRanch }),
            },
            {
                key: 'vaccinations',
                table: 'vaccinations',
                alias: 'v',
                repo: this.vaccinationsRepo,
                dto: VaccinationSyncDto,
                applyRanchFilter: (qb, idRanch) =>
                    qb.innerJoin(AnimalEvent, 'ae', 'ae.id = v.idEvent').innerJoin(RanchAnimal, 'ra', 'ra.id = ae.idRanchAnimal').where('ra.idRanch = :idRanch', { idRanch }),
            },
            {
                key: 'treatments',
                table: 'treatments',
                alias: 't',
                repo: this.treatmentsRepo,
                dto: TreatmentSyncDto,
                applyRanchFilter: (qb, idRanch) =>
                    qb.innerJoin(AnimalEvent, 'ae', 'ae.id = t.idEvent').innerJoin(RanchAnimal, 'ra', 'ra.id = ae.idRanchAnimal').where('ra.idRanch = :idRanch', { idRanch }),
            },
            {
                key: 'healthIncidents',
                table: 'health_incidents',
                alias: 'hi',
                repo: this.healthIncidentsRepo,
                dto: HealthIncidentSyncDto,
                applyRanchFilter: (qb, idRanch) =>
                    qb.innerJoin(AnimalEvent, 'ae', 'ae.id = hi.idEvent').innerJoin(RanchAnimal, 'ra', 'ra.id = ae.idRanchAnimal').where('ra.idRanch = :idRanch', { idRanch }),
            },
            {
                key: 'movements',
                table: 'movements',
                alias: 'mv',
                repo: this.movementsRepo,
                dto: MovementSyncDto,
                applyRanchFilter: (qb, idRanch) => qb.where('mv.idRanch = :idRanch', { idRanch }),
            },
            {
                key: 'movementAnimals',
                table: 'movement_animals',
                alias: 'ma',
                repo: this.movementAnimalsRepo,
                dto: MovementAnimalSyncDto,
                applyRanchFilter: (qb, idRanch) => qb.innerJoin(Movement, 'mv', 'mv.id = ma.idMovement').where('mv.idRanch = :idRanch', { idRanch }),
            },
            {
                key: 'animalExits',
                table: 'animal_exits',
                alias: 'aex',
                repo: this.animalExitsRepo,
                dto: AnimalExitSyncDto,
                applyRanchFilter: (qb, idRanch) =>
                    qb.innerJoin(AnimalEvent, 'ae', 'ae.id = aex.idEvent').innerJoin(RanchAnimal, 'ra', 'ra.id = ae.idRanchAnimal').where('ra.idRanch = :idRanch', { idRanch }),
            },
        ];
    }

    private decodeCursor(cursor?: string): CursorMap {
        if (!cursor) return {};
        try {
            const json = Buffer.from(cursor, 'base64').toString('utf-8');
            const parsed = JSON.parse(json);
            return typeof parsed === 'object' && parsed !== null ? parsed : {};
        } catch {
            return {};
        }
    }

    private encodeCursor(map: CursorMap): string {
        return Buffer.from(JSON.stringify(map), 'utf-8').toString('base64');
    }
}
