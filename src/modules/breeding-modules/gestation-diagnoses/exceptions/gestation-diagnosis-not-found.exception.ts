import { MyNotFoundException } from 'src/shared/exceptions';

export class GestationDiagnosisNotFoundException extends MyNotFoundException {
    constructor(id: number) {
        super(`El diagnóstico de gestación con ID = ${id} no fue encontrado.`, 'GESTATION_DIAGNOSIS_NOT_FOUND');
    }
}
