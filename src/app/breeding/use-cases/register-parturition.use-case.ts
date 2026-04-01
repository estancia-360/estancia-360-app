import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RegisterParturitionDto } from '../dto/inputs/register-parturition.dto';
import { AnimalEventsService } from 'src/modules/ranch-management/animal-events/services/animal-events.service';
import { ParturitionsService } from 'src/modules/breeding-modules/parturitions/services/parturitions.service';
import { GestationDiagnosesService } from 'src/modules/breeding-modules/gestation-diagnoses/services/gestation-diagnoses.service';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { ParturitionDto } from 'src/modules/breeding-modules/parturitions/dto/parturition.dto';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';
import { GestationDiagnosisDto } from 'src/modules/breeding-modules/gestation-diagnoses/dto/gestation-diagnosis.dto';
import { EVENT_TYPE_IDS } from '../constants/event-type-ids.constant';
import { MyConflictException, MyNotFoundException, MyBadRequestException } from 'src/shared/exceptions';

@Injectable()
export class RegisterParturitionUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly animalEventsService: AnimalEventsService,
        private readonly gestationDiagnosesService: GestationDiagnosesService,
        private readonly parturitionsService: ParturitionsService,
    ) {}

    /**
     * Registra un parto (parturición) a partir de un diagnóstico de gestación positivo.
     * Validaciones previas:
     *  - La madre existe y es hembra.
     *  - El diagnóstico de gestación existe, pertenece a la madre y su resultado es 'pregnant'.
     *  - No existe ya un parto para ese diagnóstico (relación 1:1 diagnóstico ↔ parto).
     *  - Si criaStatus = 'alive', criaData es obligatorio (validado en el DTO).
     * Dentro de la transacción:
     *  1. Crea el evento animal de tipo BIRTH para la madre.
     *  2. Si la cría nació viva, crea un nuevo registro RanchAnimal para la cría.
     *  3. Crea el registro del parto.
     *  4. Marca a la madre como hasCalved = true.
     *
     * @param dto - Datos del parto.
     * @returns ParturitionDto con los datos del parto creado y sus relaciones.
     */
    async execute(dto: RegisterParturitionDto): Promise<ParturitionDto> {
        // Pre-transaction: validar madre (hembra, get idRanch via RanchAnimalPlainDto)
        const mother = await this.ranchAnimalsService.findOneById(dto.idRanchAnimal, {
            throwException: true,
            template: RanchAnimalPlainDto,
            where: { sex: 'F' },
        });

        // Pre-transaction: validar diagnóstico
        const diagnosis = await this.gestationDiagnosesService.findOneById(
            dto.idDiagnosis,
            { throwException: true, template: GestationDiagnosisDto },
        );

        // Verificar que el diagnóstico pertenece al mismo animal
        if (diagnosis!.event.idRanchAnimal !== dto.idRanchAnimal) {
            throw new MyNotFoundException(
                `El diagnóstico de gestación ID=${dto.idDiagnosis} no pertenece al animal ID=${dto.idRanchAnimal}.`,
            );
        }

        // Verificar que el resultado del diagnóstico es 'pregnant'
        if (diagnosis!.result !== 'pregnant') {
            throw new MyBadRequestException(
                `El diagnóstico ID=${dto.idDiagnosis} tiene resultado "${diagnosis!.result}". Solo se puede registrar un parto sobre un diagnóstico positivo (pregnant).`,
            );
        }

        // Verificar unicidad 1:1 diagnóstico ↔ parto
        const existingParturition = await this.parturitionsService.findOneByDiagnosisId(dto.idDiagnosis);
        if (existingParturition) {
            throw new MyConflictException(
                `Ya existe un parto registrado para el diagnóstico ID=${dto.idDiagnosis}.`,
            );
        }

        return await this.dataSource.transaction(async (manager) => {
            // 1. Crear el evento animal para la madre
            const event = await this.animalEventsService.create({
                idRanchAnimal: dto.idRanchAnimal,
                idEventType: EVENT_TYPE_IDS.BIRTH,
                notes: dto.notes,
                isSynced: dto.isSynced ?? false,
                eventDate: new Date(dto.eventDate),
            }, manager);

            // 2. Si la cría nació viva, crear el registro de la cría
            let idCria: number | undefined;
            if (dto.criaStatus === 'alive' && dto.criaData) {
                const cria = await this.ranchAnimalsService.createCria(
                    {
                        idRanch: mother!.idRanch,
                        idBreed: dto.criaData.idBreed,
                        idStatus: dto.criaData.idStatus,
                        code: dto.criaData.code,
                        sex: dto.criaData.sex,
                        birthdate: new Date(dto.eventDate),
                        weight: dto.criaData.weight,
                        idMother: dto.idRanchAnimal,
                    },
                    manager,
                );
                idCria = cria.id;
            }

            // 3. Crear el registro del parto
            const parturition = await this.parturitionsService.create({
                idEvent: event.id,
                idDiagnosis: dto.idDiagnosis,
                idCria,
                birthType: dto.birthType,
                criaWeight: dto.criaWeight,
                criaStatus: dto.criaStatus,
                motherCondition: dto.motherCondition,
            }, manager);

            // 4. Marcar a la madre como hasCalved = true
            await this.ranchAnimalsService.markHasCalved(dto.idRanchAnimal, manager);

            // 5. Retornar el DTO completo
            return (await this.parturitionsService.findOneById(
                parturition.id,
                { throwException: true, template: ParturitionDto },
                manager,
            ))!;
        });
    }
}
