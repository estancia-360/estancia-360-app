import { NotFoundException } from '@nestjs/common';

export class WeightRecordNotFoundException extends NotFoundException {
    constructor(id: number) {
        super({ message: `Weight record ID=${id} not found.`, error: 'WEIGHT_RECORD_NOT_FOUND' });
    }
}
