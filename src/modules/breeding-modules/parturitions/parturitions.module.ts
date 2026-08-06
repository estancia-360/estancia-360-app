import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Parturition } from './entities/parturition.entity';
import { ParturitionsService } from './services/parturitions.service';
import { ParturitionsController } from './controllers/parturitions.controller';
import { RanchAnimalsModule } from 'src/modules/ranch-management/ranch-animals/ranch-animals.module';
import { RanchUsersModule } from 'src/modules/ranch-management/ranch-users/ranch-users.module';

@Module({
    imports: [TypeOrmModule.forFeature([Parturition]), RanchAnimalsModule, RanchUsersModule],
    controllers: [ParturitionsController],
    providers: [ParturitionsService],
    exports: [ParturitionsService],
})
export class ParturitionsModule {}
