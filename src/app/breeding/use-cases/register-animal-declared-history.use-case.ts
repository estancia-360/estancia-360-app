import { Injectable } from '@nestjs/common';
import { RegisterAnimalDeclaredHistoryDto } from '../dto/inputs/register-animal-declared-history.dto';
import { AnimalDeclaredHistoryService } from 'src/modules/breeding-modules/animal-declared-history/services/animal-declared-history.service';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { AnimalDeclaredHistoryDto } from 'src/modules/breeding-modules/animal-declared-history/dto/animal-declared-history.dto';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';
import { MyConflictException } from 'src/shared/exceptions';

@Injectable()
export class RegisterAnimalDeclaredHistoryUseCase {
    constructor(
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly animalDeclaredHistoryService: AnimalDeclaredHistoryService,
    ) {}

    /**
     * Registra el historial reproductivo declarado de un animal.
     * Este historial recoge partos previos y datos productivos declarados por el productor
     * antes del ingreso del animal al sistema.
     *
     * Validaciones:
     *  - El animal existe.
     *  - No existe ya un historial declarado para ese animal (relación 1:1).
     *
     * No requiere transacción ya que es una operación sobre una sola tabla.
     *
     * @param dto - Datos del historial declarado.
     * @returns AnimalDeclaredHistoryDto con el historial registrado.
     */
    async execute(dto: RegisterAnimalDeclaredHistoryDto): Promise<AnimalDeclaredHistoryDto> {
        // Validar que el animal existe
        await this.ranchAnimalsService.findOneById(dto.idRanchAnimal, {
            throwException: true,
            template: RanchAnimalPlainDto,
        });

        // Verificar unicidad 1:1 animal ↔ historial declarado
        const existing = await this.animalDeclaredHistoryService.findOneByAnimalId(
            dto.idRanchAnimal,
            { throwException: false, template: AnimalDeclaredHistoryDto },
        );
        if (existing) {
            throw new MyConflictException(
                `El animal ID=${dto.idRanchAnimal} ya tiene un historial declarado registrado.`,
            );
        }

        // Crear el historial declarado
        const history = await this.animalDeclaredHistoryService.create({
            idRanchAnimal: dto.idRanchAnimal,
            prevBirthsCount: dto.prevBirthsCount,
            prevLastBirthYear: dto.prevLastBirthYear,
            prevAvgWeaningWeight: dto.prevAvgWeaningWeight,
            notes: dto.notes,
        });

        // Retornar el DTO completo
        return (await this.animalDeclaredHistoryService.findOneById(
            history.id,
            { throwException: true, template: AnimalDeclaredHistoryDto },
        ))!;
    }
}
