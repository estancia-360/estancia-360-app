import { NotFoundException } from '@nestjs/common';

export class WeaningNotFoundException extends NotFoundException {
    constructor(id: number) {
        super({ message: `Weaning ID=${id} not found.`, error: 'WEANING_NOT_FOUND' });
    }
}
