import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { AdminUsersController } from './controllers/admin-users.controller';

@Module({
    imports:     [TypeOrmModule.forFeature([User])],
    controllers: [UsersController, AdminUsersController],
    providers:   [UsersService],
    exports:     [UsersService],
})
export class UsersModule {}
