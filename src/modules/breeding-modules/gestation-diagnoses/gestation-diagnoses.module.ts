import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GestationDiagnosis } from './entities/gestation-diagnosis.entity';
import { GestationDiagnosesService } from './services/gestation-diagnoses.service';
import { GestationDiagnosesController } from './controllers/gestation-diagnoses.controller';

@Module({
    imports: [TypeOrmModule.forFeature([GestationDiagnosis])],
    controllers: [GestationDiagnosesController],
    providers: [GestationDiagnosesService],
    exports: [GestationDiagnosesService],
})
export class GestationDiagnosesModule {}
