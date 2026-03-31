import { PartialType } from '@nestjs/swagger';
import { CreateAnimalDeclaredHistoryDto } from './create-animal-declared-history.dto';

export class UpdateAnimalDeclaredHistoryDto extends PartialType(CreateAnimalDeclaredHistoryDto) {}
