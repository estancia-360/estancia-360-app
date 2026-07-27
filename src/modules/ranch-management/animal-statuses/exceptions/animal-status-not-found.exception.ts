import { NotFoundException } from '@nestjs/common';

export class AnimalStatusNotFoundException extends NotFoundException {
    constructor(id: number) {
        super({ message: `Animal status ID=${id} not found.`, error: 'ANIMAL_STATUS_NOT_FOUND' });
    }
}
