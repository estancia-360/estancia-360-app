import { Module } from '@nestjs/common';
import { ProductiveStatusesService } from './services/productive-statuses.service';
import { ProductiveStatusesController } from './controllers/productive-statuses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductiveStatus } from './entities/productive-status.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([ProductiveStatus])
	],
	controllers: [ProductiveStatusesController],
	providers: [ProductiveStatusesService],
})
export class ProductiveStatusesModule { }
