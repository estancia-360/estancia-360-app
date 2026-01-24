import { PartialType } from '@nestjs/swagger';
import { CreateRanchUserDto } from './create-ranch-user.dto';

export class UpdateRanchUserDto extends PartialType(CreateRanchUserDto) {}
