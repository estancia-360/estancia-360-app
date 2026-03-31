import { PartialType } from '@nestjs/swagger';
import { CreateRanchPastureDto } from './create-ranch-pasture.dto';

export class UpdateRanchPastureDto extends PartialType(CreateRanchPastureDto) {}
