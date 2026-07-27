import { NotFoundException } from '@nestjs/common';

export class AnimalExitNotFoundException extends NotFoundException {
    constructor(id: number) {
        super({ message: `Animal exit ID=${id} not found.`, error: 'ANIMAL_EXIT_NOT_FOUND' });
    }
}
