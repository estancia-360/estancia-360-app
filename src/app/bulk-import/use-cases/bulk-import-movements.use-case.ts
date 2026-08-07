import { BadRequestException, Injectable } from '@nestjs/common';
import { BulkImportMovementsDto } from '../dto/inputs/bulk-import-movements.dto';
import { BulkImportMovementsResultDto } from '../dto/outputs/bulk-import-movements-result.dto';
import { RegisterMovementUseCase } from 'src/app/movements/use-cases/register-movement.use-case';
import { RegisterAnimalExitUseCase } from 'src/app/movements/use-cases/register-animal-exit.use-case';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';
import { runBulkRows } from '../utils/run-bulk-rows.util';

@Injectable()
export class BulkImportMovementsUseCase {
    constructor(
        private readonly registerMovementUseCase: RegisterMovementUseCase,
        private readonly registerAnimalExitUseCase: RegisterAnimalExitUseCase,
        private readonly ranchUsersService: RanchUsersService,
    ) {}

    async execute(dto: BulkImportMovementsDto, idUser: number): Promise<BulkImportMovementsResultDto> {
        await this.ranchUsersService.assertMember(idUser, dto.idRanch);

        const groups = dto.groups ?? [];
        const exits = dto.exits ?? [];
        if (groups.length === 0 && exits.length === 0) {
            throw new BadRequestException({ message: 'At least one of groups or exits must have rows.', error: 'BULK_IMPORT_EMPTY' });
        }

        return {
            movements: await runBulkRows(groups, async (group) => {
                const movement = await this.registerMovementUseCase.execute({ ...group, idRanch: dto.idRanch, isSynced: false }, idUser);
                return movement.id;
            }),
            exits: await runBulkRows(exits, async (row) => {
                const exit = await this.registerAnimalExitUseCase.execute({ ...row, isSynced: false }, idUser);
                return exit.id;
            }),
        };
    }
}
