import { ConflictException } from '@nestjs/common';

export class AnimalCodeAlreadyExistsException extends ConflictException {
    constructor() {
        super({ message: 'An animal with this code already exists in the ranch.', error: 'ANIMAL_CODE_ALREADY_EXISTS' });
    }
}
