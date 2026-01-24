import { Module } from '@nestjs/common';
import { CitiesService } from './services/cities.service';
import { CitiesController } from './controllers/cities.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { City } from './entities/city.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([City])
	],
	controllers: [CitiesController],
	providers: [CitiesService],
	exports: [CitiesService]
})
export class CitiesModule { }
