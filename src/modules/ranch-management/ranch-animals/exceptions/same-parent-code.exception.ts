import { ConflictException } from '@nestjs/common';

export class SameParentCodeException extends ConflictException {
    constructor() {
        super({ message: 'Mother and father cannot have the same code.', error: 'SAME_PARENT_CODE' });
    }
}
