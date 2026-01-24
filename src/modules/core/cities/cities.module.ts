import { Module } from '@nestjs/common';
import { CitiesService } from './services/cities.service';
import { CitiesController } from './controllers/cities.controller';

@Module({
  controllers: [CitiesController],
  providers: [CitiesService],
})
export class CitiesModule {}
