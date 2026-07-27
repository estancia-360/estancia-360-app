import { NotFoundException } from '@nestjs/common';

export class CityNotFoundException extends NotFoundException {
    constructor() {
        super({ message: 'City not found.', error: 'CITY_NOT_FOUND' });
    }
}
