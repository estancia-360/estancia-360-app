import { ConflictException } from '@nestjs/common';

export class RanchLotHasAnimalsException extends ConflictException {
    constructor(id: number) {
        super({
            message: `Ranch lot ID=${id} still has animals assigned to it — reassign them before deleting.`,
            error: 'RANCH_LOT_HAS_ANIMALS',
        });
    }
}
