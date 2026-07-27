import { NotFoundException } from '@nestjs/common';

export class RanchPastureNotFoundException extends NotFoundException {
    constructor(id: number) {
        super({ message: `Ranch pasture ID=${id} not found.`, error: 'RANCH_PASTURE_NOT_FOUND' });
    }
}
