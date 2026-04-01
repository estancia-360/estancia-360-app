import { Injectable } from '@nestjs/common';
import { UpdateGestationDiagnosisDto } from '../dto/inputs/update-gestation-diagnosis.dto';
import { GestationDiagnosesService } from 'src/modules/breeding-modules/gestation-diagnoses/services/gestation-diagnoses.service';
import { GestationDiagnosisDto } from 'src/modules/breeding-modules/gestation-diagnoses/dto/gestation-diagnosis.dto';

@Injectable()
export class UpdateGestationDiagnosisUseCase {
    constructor(
        private readonly gestationDiagnosesService: GestationDiagnosesService,
    ) {}

    /**
     * Actualiza los campos editables de un diagnóstico de gestación.
     * Lanza GestationDiagnosisNotFoundException si no existe el registro.
     */
    async execute(id: number, dto: UpdateGestationDiagnosisDto): Promise<GestationDiagnosisDto> {
        await this.gestationDiagnosesService.update(id, dto);
        return (await this.gestationDiagnosesService.findOneById(
            id,
            { throwException: true, template: GestationDiagnosisDto },
        ))!;
    }
}
