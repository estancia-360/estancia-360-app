import { PartialType } from '@nestjs/swagger';
import { CreateParturitionDto } from './create-parturition.dto';

export class UpdateParturitionDto extends PartialType(CreateParturitionDto) {}
