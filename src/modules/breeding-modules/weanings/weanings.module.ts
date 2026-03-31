import { Module } from '@nestjs/common';
import { WeaningsService } from './services/weanings.service';
import { WeaningsController } from './controllers/weanings.controller';

@Module({
  controllers: [WeaningsController],
  providers: [WeaningsService],
})
export class WeaningsModule {}
