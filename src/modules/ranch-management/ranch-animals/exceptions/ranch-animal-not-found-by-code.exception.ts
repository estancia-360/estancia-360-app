import { NotFoundException } from '@nestjs/common';

export class RanchAnimalNotFoundByCodeException extends NotFoundException {
    constructor(code: string) {
        super({ message: `Animal with code=${code} not found.`, error: 'ANIMAL_NOT_FOUND' });
    }
}
