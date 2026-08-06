import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Weaning } from './entities/weaning.entity';
import { WeaningsService } from './services/weanings.service';
import { WeaningsController } from './controllers/weanings.controller';
import { RanchAnimalsModule } from 'src/modules/ranch-management/ranch-animals/ranch-animals.module';
import { RanchUsersModule } from 'src/modules/ranch-management/ranch-users/ranch-users.module';

@Module({
    imports: [TypeOrmModule.forFeature([Weaning]), RanchAnimalsModule, RanchUsersModule],
    controllers: [WeaningsController],
    providers: [WeaningsService],
    exports: [WeaningsService],
})
export class WeaningsModule {}
