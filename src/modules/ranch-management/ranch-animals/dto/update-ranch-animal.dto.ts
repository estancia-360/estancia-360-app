import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateRanchAnimalDto } from './create-ranch-animal.dto';

// idRanch NUNCA es editable acá — un animal no se "mueve" de estancia por update (eso
// es lo que existen purchase/ranch_exit/animal_exit para). Permitirlo era un agujero:
// cualquiera podía reasignar el animal de otra estancia a la propia con solo mandar su
// propio idRanch en el body.
export class UpdateRanchAnimalDto extends PartialType(OmitType(CreateRanchAnimalDto, ['idRanch'] as const)) {}
