import { Module } from '@nestjs/common';
import { ParturitionsService } from './services/parturitions.service';
import { ParturitionsController } from './controllers/parturitions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Parturition } from './entities/parturition.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Parturition]),
    ],
    controllers: [ParturitionsController],
    providers: [ParturitionsService],
    exports: [ParturitionsService],
})
export class ParturitionsModule {}
