import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RegisterParturitionDto } from '../dto/inputs/register-parturition.dto';
import { AnimalEventsService } from 'src/modules/ranch-management/animal-events/services/animal-events.service';
import { ParturitionsService } from 'src/modules/breeding-modules/parturitions/services/parturitions.service';
import { GestationDiagnosesService } from 'src/modules/breeding-modules/gestation-diagnoses/services/gestation-diagnoses.service';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';
import { ParturitionDto } from 'src/modules/breeding-modules/parturitions/dto/parturition.dto';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';
import { GestationDiagnosisDto } from 'src/modules/breeding-modules/gestation-diagnoses/dto/gestation-diagnosis.dto';
import { EVENT_TYPE_IDS, PRODUCTION_TYPE_IDS } from 'src/shared/constants';
import { CriaStatusEnum } from 'src/modules/breeding-modules/parturitions/entities/parturition.entity';
import { GestationResultEnum } from 'src/modules/breeding-modules/gestation-diagnoses/entities/gestation-diagnosis.entity';
import { RanchSubscriptionsService } from 'src/modules/payment-modules/ranch-subscriptions/services/ranch-subscriptions.service';
import { RanchAnimalNotFoundException } from 'src/modules/ranch-management/ranch-animals/exceptions';
import { RanchesService } from 'src/modules/ranch-management/ranches/services/ranches.service';

@Injectable()
export class RegisterParturitionUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly ranchUsersService: RanchUsersService,
        private readonly ranchesService: RanchesService,
        private readonly animalEventsService: AnimalEventsService,
        private readonly gestationDiagnosesService: GestationDiagnosesService,
        private readonly parturitionsService: ParturitionsService,
        private readonly ranchSubscriptionsService: RanchSubscriptionsService,
    ) {}

    async execute(dto: RegisterParturitionDto, idUser: number): Promise<ParturitionDto> {
        const mother = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, dto.idRanchAnimal);
        if (mother.sex !== 'F') throw new RanchAnimalNotFoundException(dto.idRanchAnimal);
        await this.ranchUsersService.assertMember(idUser, mother.idRanch);

        const hasCria = await this.ranchesService.hasProductionTypeEnabled(mother.idRanch, PRODUCTION_TYPE_IDS.CRIA);
        if (!hasCria) {
            throw new BadRequestException({
                message: `Ranch ID=${mother.idRanch} does not have Cría enabled as a rubro.`,
                error: 'RANCH_PRODUCTION_TYPE_NOT_ENABLED',
            });
        }

        const diagnosis = await this.gestationDiagnosesService.findOneById(GestationDiagnosisDto, dto.idDiagnosis);
        if (diagnosis.event.idRanchAnimal !== dto.idRanchAnimal) {
            throw new NotFoundException({
                message: `Gestation diagnosis ID=${dto.idDiagnosis} does not belong to animal ID=${dto.idRanchAnimal}.`,
                error: 'GESTATION_DIAGNOSIS_NOT_FOUND',
            });
        }
        if (diagnosis.result !== GestationResultEnum.PREGNANT) {
            throw new BadRequestException({
                message: `Diagnosis ID=${dto.idDiagnosis} has result "${diagnosis.result}". A birth can only be registered on a positive (pregnant) diagnosis.`,
                error: 'DIAGNOSIS_NOT_PREGNANT',
            });
        }

        const existingParturition = await this.parturitionsService.findOneByDiagnosisId(dto.idDiagnosis);
        if (existingParturition) {
            throw new ConflictException({
                message: `A parturition is already registered for diagnosis ID=${dto.idDiagnosis}.`,
                error: 'PARTURITION_ALREADY_EXISTS',
            });
        }

        // Capacidad solo se chequea si ESTE llamado va a crear un animal nuevo. Cuando viene
        // dto.idCria (caso offline: el mobile ya sincronizó la cría como su propio alta en
        // ranch_animals antes de que este evento llegue), la capacidad ya se validó ahí.
        if (dto.criaStatus === CriaStatusEnum.ALIVE && dto.criaData && !dto.idCria) {
            const currentActiveCount = await this.ranchAnimalsService.countActiveByRanch(mother.idRanch);
            await this.ranchSubscriptionsService.assertCapacityAvailable(mother.idRanch, currentActiveCount, 1);
        }

        return await this.dataSource.transaction(async (manager) => {
            const event = await this.animalEventsService.create(
                {
                    idRanchAnimal: dto.idRanchAnimal,
                    idEventType: EVENT_TYPE_IDS.BIRTH,
                    idUser,
                    notes: dto.notes,
                    isSynced: dto.isSynced ?? false,
                    eventDate: new Date(dto.eventDate),
                },
                manager,
            );

            let idCria: number | undefined = dto.idCria;
            if (dto.criaStatus === CriaStatusEnum.ALIVE && dto.criaData && !idCria) {
                const cria = await this.ranchAnimalsService.createCria(
                    {
                        idRanch: mother.idRanch,
                        idBreed: dto.criaData.idBreed,
                        idStatus: dto.criaData.idStatus,
                        idAnimalClass: dto.criaData.idAnimalClass,
                        code: dto.criaData.code,
                        sex: dto.criaData.sex,
                        birthdate: new Date(dto.eventDate),
                        // 12d (auditoria QA E2E, 2026-09-03): criaWeight (peso al nacer, va a
                        // parturitions.cria_weight) y criaData.weight son campos independientes en
                        // el DTO — si el cliente solo manda el primero, la ficha del animal quedaba
                        // sin peso. criaData.weight gana si ambos vienen (puede ser una segunda
                        // pesada mas precisa), pero criaWeight sirve de respaldo.
                        weight: dto.criaData.weight ?? dto.criaWeight,
                        idMother: dto.idRanchAnimal,
                    },
                    manager,
                );
                idCria = cria.id;
            }

            const parturition = await this.parturitionsService.create(
                {
                    idEvent: event.id,
                    idDiagnosis: dto.idDiagnosis,
                    idCria,
                    birthType: dto.birthType,
                    criaWeight: dto.criaWeight,
                    criaStatus: dto.criaStatus,
                    motherCondition: dto.motherCondition,
                    localId: dto.localId,
                },
                manager,
            );

            return (await this.parturitionsService.findOneById(
                ParturitionDto,
                parturition.id,
                { throwException: true },
                manager,
            ))!;
        });
    }
}
