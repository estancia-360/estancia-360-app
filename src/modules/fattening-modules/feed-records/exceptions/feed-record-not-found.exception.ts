import { NotFoundException } from '@nestjs/common';

export class FeedRecordNotFoundException extends NotFoundException {
    constructor(id: number) {
        super({ message: `Feed record ID=${id} not found.`, error: 'FEED_RECORD_NOT_FOUND' });
    }
}
