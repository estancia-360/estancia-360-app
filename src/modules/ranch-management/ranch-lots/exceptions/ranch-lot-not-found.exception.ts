import { NotFoundException } from '@nestjs/common';

export class RanchLotNotFoundException extends NotFoundException {
    constructor(id: number) {
        super({ message: `Ranch lot ID=${id} not found.`, error: 'RANCH_LOT_NOT_FOUND' });
    }
}
