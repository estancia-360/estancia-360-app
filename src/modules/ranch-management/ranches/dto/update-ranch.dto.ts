import { PartialType } from '@nestjs/swagger';
import { CreateRanchDto } from './create-ranch.dto';

export class UpdateRanchDto extends PartialType(CreateRanchDto) {}
