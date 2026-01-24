import { Injectable } from '@nestjs/common';
import { CreateProductionTypeDto } from '../dto/create-production-type.dto';
import { UpdateProductionTypeDto } from '../dto/update-production-type.dto';

@Injectable()
export class ProductionTypesService {
  create(createProductionTypeDto: CreateProductionTypeDto) {
    return 'This action adds a new productionType';
  }

  findAll() {
    return `This action returns all productionTypes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} productionType`;
  }

  update(id: number, updateProductionTypeDto: UpdateProductionTypeDto) {
    return `This action updates a #${id} productionType`;
  }

  remove(id: number) {
    return `This action removes a #${id} productionType`;
  }
}
