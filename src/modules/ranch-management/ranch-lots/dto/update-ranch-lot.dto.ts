import { PartialType } from '@nestjs/swagger';
import { CreateRanchLotDto } from './create-ranch-lot.dto';

export class UpdateRanchLotDto extends PartialType(CreateRanchLotDto) {}
