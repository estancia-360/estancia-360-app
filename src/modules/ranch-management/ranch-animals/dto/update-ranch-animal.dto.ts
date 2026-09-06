import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateRanchAnimalDto } from './create-ranch-animal.dto';

// idRanch NUNCA es editable acá — un animal no se "mueve" de estancia por update (eso
// es lo que existen purchase/ranch_exit/animal_exit para). Permitirlo era un agujero:
// cualquiera podía reasignar el animal de otra estancia a la propia con solo mandar su
// propio idRanch en el body.
//
// BUS-001 (auditoria QA, 2026-08-25): idProductiveStatus tampoco es editable acá — es
// consecuencia del ciclo (parto, destete, selección de recría, movimientos), nunca un campo
// libre. Dejarlo pasar permitía saltar etapas (Cría -> Engorde directo) sin validar
// prerequisitos. El ValidationPipe global (forbidNonWhitelisted) ahora rechaza con 400
// cualquier request que todavía intente mandarlo, en vez de ignorarlo en silencio.
export class UpdateRanchAnimalDto extends PartialType(OmitType(CreateRanchAnimalDto, ['idRanch', 'idProductiveStatus'] as const)) {}
