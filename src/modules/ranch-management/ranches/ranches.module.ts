import { Module } from '@nestjs/common';
import { RanchesService } from './services/ranches.service';
import { RanchesController } from './controllers/ranches.controller';

@Module({
  controllers: [RanchesController],
  providers: [RanchesService],
})
export class RanchesModule {}
