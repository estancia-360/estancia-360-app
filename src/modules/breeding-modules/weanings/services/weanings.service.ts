import { Injectable } from '@nestjs/common';
import { CreateWeaningDto } from '../dto/create-weaning.dto';
import { UpdateWeaningDto } from '../dto/update-weaning.dto';

@Injectable()
export class WeaningsService {
  create(createWeaningDto: CreateWeaningDto) {
    return 'This action adds a new weaning';
  }

  findAll() {
    return `This action returns all weanings`;
  }

  findOne(id: number) {
    return `This action returns a #${id} weaning`;
  }

  update(id: number, updateWeaningDto: UpdateWeaningDto) {
    return `This action updates a #${id} weaning`;
  }

  remove(id: number) {
    return `This action removes a #${id} weaning`;
  }
}
