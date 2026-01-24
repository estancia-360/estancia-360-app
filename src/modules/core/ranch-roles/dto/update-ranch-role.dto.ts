import { PartialType } from '@nestjs/swagger';
import { CreateRanchRoleDto } from './create-ranch-role.dto';

export class UpdateRanchRoleDto extends PartialType(CreateRanchRoleDto) {}
