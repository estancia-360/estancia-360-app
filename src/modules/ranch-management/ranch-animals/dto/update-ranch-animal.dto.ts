import { PartialType } from '@nestjs/swagger';
import { CreateRanchAnimalDto } from './create-ranch-animal.dto';

export class UpdateRanchAnimalDto extends PartialType(CreateRanchAnimalDto) {}
