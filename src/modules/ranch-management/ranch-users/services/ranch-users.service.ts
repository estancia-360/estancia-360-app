import { Injectable } from '@nestjs/common';
import { CreateRanchUserDto } from '../dto/create-ranch-user.dto';
import { UpdateRanchUserDto } from '../dto/update-ranch-user.dto';

@Injectable()
export class RanchUsersService {
  create(createRanchUserDto: CreateRanchUserDto) {
    return 'This action adds a new ranchUser';
  }

  findAll() {
    return `This action returns all ranchUsers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ranchUser`;
  }

  update(id: number, updateRanchUserDto: UpdateRanchUserDto) {
    return `This action updates a #${id} ranchUser`;
  }

  remove(id: number) {
    return `This action removes a #${id} ranchUser`;
  }
}
