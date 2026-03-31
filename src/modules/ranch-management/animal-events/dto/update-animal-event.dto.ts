import { PartialType } from '@nestjs/swagger';
import { CreateAnimalEventDto } from './create-animal-event.dto';

export class UpdateAnimalEventDto extends PartialType(CreateAnimalEventDto) {}
