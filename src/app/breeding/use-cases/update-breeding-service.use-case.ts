import { Injectable } from '@nestjs/common';
import { UpdateBreedingServiceDto } from '../dto/inputs/update-breeding-service.dto';
import { BreedingServicesService } from 'src/modules/breeding-modules/breeding-services/services/breeding-services.service';
import { BreedingServiceDto } from 'src/modules/breeding-modules/breeding-services/dto/breeding-service.dto';

@Injectable()
export class UpdateBreedingServiceUseCase {
    constructor(private readonly breedingServicesService: BreedingServicesService) {}

    async execute(id: number, dto: UpdateBreedingServiceDto): Promise<BreedingServiceDto> {
        await this.breedingServicesService.update(id, dto);
        return (await this.breedingServicesService.findOneById(BreedingServiceDto, id, { throwException: true }))!;
    }
}
