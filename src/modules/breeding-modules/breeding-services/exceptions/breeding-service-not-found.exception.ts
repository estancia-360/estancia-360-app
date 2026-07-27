import { NotFoundException } from '@nestjs/common';

export class BreedingServiceNotFoundException extends NotFoundException {
    constructor(id: number) {
        super({ message: `Breeding service ID=${id} not found.`, error: 'BREEDING_SERVICE_NOT_FOUND' });
    }
}
