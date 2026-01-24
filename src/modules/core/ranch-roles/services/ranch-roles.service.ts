import { Injectable } from '@nestjs/common';
import { CreateRanchRoleDto } from '../dto/create-ranch-role.dto';
import { UpdateRanchRoleDto } from '../dto/update-ranch-role.dto';

@Injectable()
export class RanchRolesService {
  create(createRanchRoleDto: CreateRanchRoleDto) {
    return 'This action adds a new ranchRole';
  }

  findAll() {
    return `This action returns all ranchRoles`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ranchRole`;
  }

  update(id: number, updateRanchRoleDto: UpdateRanchRoleDto) {
    return `This action updates a #${id} ranchRole`;
  }

  remove(id: number) {
    return `This action removes a #${id} ranchRole`;
  }
}
