import { PartialType } from '@nestjs/swagger';
import { CreateGestationDiagnosisDto } from './create-gestation-diagnosis.dto';

export class UpdateGestationDiagnosisDto extends PartialType(CreateGestationDiagnosisDto) {}
