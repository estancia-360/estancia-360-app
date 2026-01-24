import { Injectable } from '@nestjs/common';
import { CreateRanchDto } from '../dto/create-ranch.dto';
import { UpdateRanchDto } from '../dto/update-ranch.dto';

@Injectable()
export class RanchesService {
  create(createRanchDto: CreateRanchDto) {
    return 'This action adds a new ranch';
  }

  findAll() {
    return `This action returns all ranches`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ranch`;
  }

  update(id: number, updateRanchDto: UpdateRanchDto) {
    return `This action updates a #${id} ranch`;
  }

  remove(id: number) {
    return `This action removes a #${id} ranch`;
  }
}
