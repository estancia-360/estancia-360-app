import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RanchLot } from './entities/ranch-lot.entity';
import { RanchLotsService } from './services/ranch-lots.service';
import { RanchLotsController } from './controllers/ranch-lots.controller';
import { RanchesModule } from 'src/modules/ranch-management/ranches/ranches.module';
import { RanchPasturesModule } from 'src/modules/ranch-management/ranch-pastures/ranch-pastures.module';
import { RanchUsersModule } from 'src/modules/ranch-management/ranch-users/ranch-users.module';

@Module({
    imports: [TypeOrmModule.forFeature([RanchLot]), RanchesModule, RanchPasturesModule, RanchUsersModule],
    controllers: [RanchLotsController],
    providers: [RanchLotsService],
    exports: [RanchLotsService],
})
export class RanchLotsModule {}
