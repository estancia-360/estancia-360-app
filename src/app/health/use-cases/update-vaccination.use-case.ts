import { Injectable } from '@nestjs/common';
import { VaccinationsService } from 'src/modules/health-modules/vaccinations/services/vaccinations.service';
import { VaccinationDto } from 'src/modules/health-modules/vaccinations/dto/vaccination.dto';
import { UpdateVaccinationDto } from '../dto/inputs/update-vaccination.dto';

@Injectable()
export class UpdateVaccinationUseCase {
    constructor(private readonly vaccinationsService: VaccinationsService) {}

    async execute(id: number, dto: UpdateVaccinationDto): Promise<VaccinationDto> {
        await this.vaccinationsService.update(id, {
            vaccineName: dto.vaccineName,
            dose: dto.dose,
            responsible: dto.responsible,
            notes: dto.notes,
        });
        return (await this.vaccinationsService.findOneById(id, {
            throwException: true,
            template: VaccinationDto,
        }))!;
    }
}
