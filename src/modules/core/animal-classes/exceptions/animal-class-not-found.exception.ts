import { NotFoundException } from '@nestjs/common';

export class AnimalClassNotFoundException extends NotFoundException {
    constructor(id: number) {
        super({ message: `Animal class ID=${id} not found.`, error: 'ANIMAL_CLASS_NOT_FOUND' });
    }
}
