import { Module } from '@nestjs/common';
import { CountriesService } from './services/countries.service';
import { CountriesController } from './controllers/countries.controller';

@Module({
  controllers: [CountriesController],
  providers: [CountriesService],
})
export class CountriesModule {}
