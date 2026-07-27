import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateRanchPastureDto } from './create-ranch-pasture.dto';

export class UpdateRanchPastureDto extends PartialType(OmitType(CreateRanchPastureDto, ['idRanch'] as const)) {}
