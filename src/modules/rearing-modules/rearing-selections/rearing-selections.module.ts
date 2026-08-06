import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RearingSelection } from './entities/rearing-selection.entity';
import { RearingSelectionsService } from './services/rearing-selections.service';
import { RearingSelectionsController } from './controllers/rearing-selections.controller';
import { RanchAnimalsModule } from 'src/modules/ranch-management/ranch-animals/ranch-animals.module';
import { RanchUsersModule } from 'src/modules/ranch-management/ranch-users/ranch-users.module';

@Module({
    imports: [TypeOrmModule.forFeature([RearingSelection]), RanchAnimalsModule, RanchUsersModule],
    controllers: [RearingSelectionsController],
    providers: [RearingSelectionsService],
    exports: [RearingSelectionsService],
})
export class RearingSelectionsModule {}
