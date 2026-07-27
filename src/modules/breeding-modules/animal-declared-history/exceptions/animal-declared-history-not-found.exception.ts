import { NotFoundException } from '@nestjs/common';

export class AnimalDeclaredHistoryNotFoundException extends NotFoundException {
    constructor(id: number) {
        super({ message: `Declared history ID=${id} not found.`, error: 'ANIMAL_DECLARED_HISTORY_NOT_FOUND' });
    }
}
