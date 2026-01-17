import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersAuthService } from './services/users-auth.service';
import { RolesModule } from 'src/modules/core/roles/roles.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([User]),
		RolesModule,
	],
	controllers: [UsersController],
	providers: [
		UsersService,
		UsersAuthService,
	],
	exports: [
		UsersService,
		UsersAuthService,
	]
})
export class UsersModule { }
