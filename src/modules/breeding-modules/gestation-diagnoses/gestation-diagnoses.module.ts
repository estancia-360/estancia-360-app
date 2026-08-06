import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GestationDiagnosis } from './entities/gestation-diagnosis.entity';
import { GestationDiagnosesService } from './services/gestation-diagnoses.service';
import { GestationDiagnosesController } from './controllers/gestation-diagnoses.controller';
import { RanchAnimalsModule } from 'src/modules/ranch-management/ranch-animals/ranch-animals.module';
import { RanchUsersModule } from 'src/modules/ranch-management/ranch-users/ranch-users.module';

@Module({
    imports: [TypeOrmModule.forFeature([GestationDiagnosis]), RanchAnimalsModule, RanchUsersModule],
    controllers: [GestationDiagnosesController],
    providers: [GestationDiagnosesService],
    exports: [GestationDiagnosesService],
})
export class GestationDiagnosesModule {}
