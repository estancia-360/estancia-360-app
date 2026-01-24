import { Module } from '@nestjs/common';
import { ProductionTypesService } from './services/production-types.service';
import { ProductionTypesController } from './controllers/production-types.controller';

@Module({
  controllers: [ProductionTypesController],
  providers: [ProductionTypesService],
})
export class ProductionTypesModule {}
