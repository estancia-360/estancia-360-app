import { NotFoundException } from '@nestjs/common';

export class ParturitionNotFoundException extends NotFoundException {
    constructor(id: number) {
        super({ message: `Parturition ID=${id} not found.`, error: 'PARTURITION_NOT_FOUND' });
    }
}
