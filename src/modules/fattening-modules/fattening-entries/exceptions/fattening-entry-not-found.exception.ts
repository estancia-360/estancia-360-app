import { NotFoundException } from '@nestjs/common';

export class FatteningEntryNotFoundException extends NotFoundException {
    constructor(id: number) {
        super({ message: `Fattening entry ID=${id} not found.`, error: 'FATTENING_ENTRY_NOT_FOUND' });
    }
}
