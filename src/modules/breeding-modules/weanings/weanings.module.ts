import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Weaning } from './entities/weaning.entity';
import { WeaningsService } from './services/weanings.service';
import { WeaningsController } from './controllers/weanings.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Weaning])],
    controllers: [WeaningsController],
    providers: [WeaningsService],
    exports: [WeaningsService],
})
export class WeaningsModule {}
