import { BadRequestException } from '@nestjs/common';

export class InvalidProductionTypesCombinationException extends BadRequestException {
    constructor() {
        super({
            message:
                'Combinación de rubros inválida. Una estancia debe seguir el orden Cría → Recría → Engorde, sin saltos: Cría sola, Cría+Recría, o Cría+Recría+Engorde.',
            error: 'INVALID_PRODUCTION_TYPES_COMBINATION',
        });
    }
}
