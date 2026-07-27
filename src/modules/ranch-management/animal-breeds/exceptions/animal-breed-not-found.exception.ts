import { NotFoundException } from '@nestjs/common';

export class AnimalBreedNotFoundException extends NotFoundException {
    constructor(id: number) {
        super({ message: `Animal breed ID=${id} not found.`, error: 'ANIMAL_BREED_NOT_FOUND' });
    }
}
