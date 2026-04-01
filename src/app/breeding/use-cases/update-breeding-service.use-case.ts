import { Injectable } from '@nestjs/common';
import { UpdateBreedingServiceDto } from '../dto/inputs/update-breeding-service.dto';
import { BreedingServicesService } from 'src/modules/breeding-modules/breeding-services/services/breeding-services.service';
import { BreedingServiceDto } from 'src/modules/breeding-modules/breeding-services/dto/breeding-service.dto';

@Injectable()
export class UpdateBreedingServiceUseCase {
    constructor(
        private readonly breedingServicesService: BreedingServicesService,
    ) {}

    /**
     * Actualiza los campos editables de un servicio de monta.
     * Lanza BreedingServiceNotFoundException si no existe el registro.
     */
    async execute(id: number, dto: UpdateBreedingServiceDto): Promise<BreedingServiceDto> {
        await this.breedingServicesService.update(id, dto);
        return (await this.breedingServicesService.findOneById(
            id,
            { throwException: true, template: BreedingServiceDto },
        ))!;
    }
}
