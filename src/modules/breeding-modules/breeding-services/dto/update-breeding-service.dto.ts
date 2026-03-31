import { PartialType } from '@nestjs/swagger';
import { CreateBreedingServiceDto } from './create-breeding-service.dto';

export class UpdateBreedingServiceDto extends PartialType(CreateBreedingServiceDto) {}
