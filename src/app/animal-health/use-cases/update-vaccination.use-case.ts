import { Injectable } from '@nestjs/common';
import { UpdateVaccinationDto } from '../dto/inputs/update-vaccination.dto';
import { VaccinationsService } from 'src/modules/health-modules/vaccinations/services/vaccinations.service';
import { VaccinationDto } from 'src/modules/health-modules/vaccinations/dto/vaccination.dto';

@Injectable()
export class UpdateVaccinationUseCase {
    constructor(private readonly vaccinationsService: VaccinationsService) {}

    async execute(id: number, dto: UpdateVaccinationDto): Promise<VaccinationDto> {
        await this.vaccinationsService.update(id, dto);
        return (await this.vaccinationsService.findOneById(VaccinationDto, id, { throwException: true }))!;
    }
}
