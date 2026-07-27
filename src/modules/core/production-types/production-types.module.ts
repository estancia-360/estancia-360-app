import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionType } from './entities/production-type.entity';
import { ProductionTypesService } from './services/production-types.service';

@Module({
    imports:   [TypeOrmModule.forFeature([ProductionType])],
    providers: [ProductionTypesService],
    exports:   [ProductionTypesService],
})
export class ProductionTypesModule {}
