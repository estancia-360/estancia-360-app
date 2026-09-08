import { Injectable } from '@nestjs/common';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';

@Injectable()
export class RemoveRanchMemberUseCase {
    constructor(private readonly ranchUsersService: RanchUsersService) {}

    async execute(idRanch: number, idTargetUser: number, requestingUserId: number): Promise<void> {
        await this.ranchUsersService.assertOwner(requestingUserId, idRanch);
        await this.ranchUsersService.remove(idTargetUser, idRanch);
    }
}
