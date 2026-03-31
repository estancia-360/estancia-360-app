import { PartialType } from '@nestjs/swagger';
import { CreateProductiveStatusDto } from './create-productive-status.dto';

export class UpdateProductiveStatusDto extends PartialType(CreateProductiveStatusDto) {}
