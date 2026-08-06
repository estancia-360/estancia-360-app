import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RanchPasture } from './entities/ranch-pasture.entity';
import { RanchPasturesService } from './services/ranch-pastures.service';
import { RanchPasturesController } from './controllers/ranch-pastures.controller';
import { RanchesModule } from 'src/modules/ranch-management/ranches/ranches.module';
import { RanchUsersModule } from 'src/modules/ranch-management/ranch-users/ranch-users.module';

@Module({
    imports: [TypeOrmModule.forFeature([RanchPasture]), RanchesModule, RanchUsersModule],
    controllers: [RanchPasturesController],
    providers: [RanchPasturesService],
    exports: [RanchPasturesService],
})
export class RanchPasturesModule {}
