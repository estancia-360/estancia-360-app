import { Module } from '@nestjs/common';
import { RegionsService } from './services/regions.service';
import { RegionsController } from './controllers/regions.controller';

@Module({
  controllers: [RegionsController],
  providers: [RegionsService],
})
export class RegionsModule {}
