import { ConflictException } from '@nestjs/common';

export class RanchPastureHasLotsException extends ConflictException {
    constructor(id: number) {
        super({
            message: `Ranch pasture ID=${id} still has lots assigned to it — delete or move them before deleting the pasture.`,
            error: 'RANCH_PASTURE_HAS_LOTS',
        });
    }
}
