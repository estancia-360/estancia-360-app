import { NotFoundException } from '@nestjs/common';

export class ProductionTypeNotFoundException extends NotFoundException {
    constructor() {
        super({ message: 'Production type not found.', error: 'PRODUCTION_TYPE_NOT_FOUND' });
    }
}
