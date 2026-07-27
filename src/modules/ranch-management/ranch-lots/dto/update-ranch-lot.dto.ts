import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateRanchLotDto } from './create-ranch-lot.dto';

export class UpdateRanchLotDto extends PartialType(OmitType(CreateRanchLotDto, ['idRanch', 'idRanchPasture'] as const)) {}
