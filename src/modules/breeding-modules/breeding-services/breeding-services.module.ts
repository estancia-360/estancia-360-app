import { Module } from '@nestjs/common';
import { BreedingServicesService } from './services/breeding-services.service';
import { BreedingServicesController } from './controllers/breeding-services.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BreedingService } from './entities/breeding-service.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([BreedingService])
	],
	controllers: [BreedingServicesController],
	providers: [BreedingServicesService],
})
export class BreedingServicesModule { }
