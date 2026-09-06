import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { AdminUsersController } from './controllers/admin-users.controller';
import { RanchUsersModule } from 'src/modules/ranch-management/ranch-users/ranch-users.module';

@Module({
    imports:     [TypeOrmModule.forFeature([User]), RanchUsersModule],
    controllers: [UsersController, AdminUsersController],
    providers:   [UsersService],
    exports:     [UsersService],
})
export class UsersModule {}
