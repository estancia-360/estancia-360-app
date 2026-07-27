import { NotFoundException } from '@nestjs/common';

export class RearingSelectionNotFoundException extends NotFoundException {
    constructor(id: number) {
        super({ message: `Rearing selection ID=${id} not found.`, error: 'REARING_SELECTION_NOT_FOUND' });
    }
}
