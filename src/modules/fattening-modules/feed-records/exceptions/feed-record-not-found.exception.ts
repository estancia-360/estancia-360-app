import { MyNotFoundException } from 'src/shared/exceptions';

export class FeedRecordNotFoundException extends MyNotFoundException {
    constructor(id: number) {
        super(`El registro de alimentación con ID=${id} no fue encontrado.`, 'FEED_RECORD_NOT_FOUND');
    }
}
