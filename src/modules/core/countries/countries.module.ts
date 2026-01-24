import { Module } from '@nestjs/common';
import { CountriesService } from './services/countries.service';
import { CountriesController } from './controllers/countries.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Country } from './entities/country.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([Country])
	],
	controllers: [CountriesController],
	providers: [CountriesService],
	exports: [CountriesService]
})
export class CountriesModule { }
