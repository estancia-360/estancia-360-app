import { Module } from '@nestjs/common';
import { UsersModule } from 'src/modules/user-management/users/users.module';
import { RanchUsersModule } from 'src/modules/ranch-management/ranch-users/ranch-users.module';
import { RanchMembersController } from './ranch-members.controller';
import { RegisterRanchMemberUseCase } from './use-cases/register-ranch-member.use-case';
import { RemoveRanchMemberUseCase } from './use-cases/remove-ranch-member.use-case';

@Module({
    imports: [UsersModule, RanchUsersModule],
    controllers: [RanchMembersController],
    providers: [RegisterRanchMemberUseCase, RemoveRanchMemberUseCase],
})
export class RanchMembersModule {}
