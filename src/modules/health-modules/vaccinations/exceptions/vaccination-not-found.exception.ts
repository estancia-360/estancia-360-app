import { NotFoundException } from '@nestjs/common';

export class VaccinationNotFoundException extends NotFoundException {
    constructor(id: number) {
        super({ message: `Vaccination ID=${id} not found.`, error: 'VACCINATION_NOT_FOUND' });
    }
}
