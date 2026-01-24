import { Module } from '@nestjs/common';
import { ProductionTypesService } from './services/production-types.service';
import { ProductionTypesController } from './controllers/production-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionType } from './entities/production-type.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([ProductionType])
	],
	controllers: [ProductionTypesController],
	providers: [ProductionTypesService],
	exports: [ProductionTypesService]
})
export class ProductionTypesModule { }
