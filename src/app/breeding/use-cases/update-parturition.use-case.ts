import { Injectable } from '@nestjs/common';
import { UpdateParturitionDto } from '../dto/inputs/update-parturition.dto';
import { ParturitionsService } from 'src/modules/breeding-modules/parturitions/services/parturitions.service';
import { ParturitionDto } from 'src/modules/breeding-modules/parturitions/dto/parturition.dto';

@Injectable()
export class UpdateParturitionUseCase {
    constructor(
        private readonly parturitionsService: ParturitionsService,
    ) {}

    /**
     * Actualiza los campos editables de un parto.
     * Lanza ParturitionNotFoundException si no existe el registro.
     */
    async execute(id: number, dto: UpdateParturitionDto): Promise<ParturitionDto> {
        await this.parturitionsService.update(id, dto);
        return (await this.parturitionsService.findOneById(
            id,
            { throwException: true, template: ParturitionDto },
        ))!;
    }
}
