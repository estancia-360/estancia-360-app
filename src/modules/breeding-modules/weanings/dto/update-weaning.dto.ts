import { PartialType } from '@nestjs/swagger';
import { CreateWeaningDto } from './create-weaning.dto';

export class UpdateWeaningDto extends PartialType(CreateWeaningDto) {}
