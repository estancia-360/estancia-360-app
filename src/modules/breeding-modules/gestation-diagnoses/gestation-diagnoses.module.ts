import { Module } from '@nestjs/common';
import { GestationDiagnosesService } from './services/gestation-diagnoses.service';
import { GestationDiagnosesController } from './controllers/gestation-diagnoses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GestationDiagnosis } from './entities/gestation-diagnosis.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([GestationDiagnosis]),
    ],
    controllers: [GestationDiagnosesController],
    providers: [GestationDiagnosesService],
    exports: [GestationDiagnosesService],
})
export class GestationDiagnosesModule {}
