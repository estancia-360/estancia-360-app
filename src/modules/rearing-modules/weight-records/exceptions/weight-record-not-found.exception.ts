import { MyNotFoundException } from 'src/shared/exceptions';

export class WeightRecordNotFoundException extends MyNotFoundException {
    constructor(id: number) {
        super(`El registro de peso con ID = ${id} no fue encontrado.`, 'WEIGHT_RECORD_NOT_FOUND');
    }
}
