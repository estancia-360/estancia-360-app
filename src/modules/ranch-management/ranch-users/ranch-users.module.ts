import { Module } from '@nestjs/common';
import { RanchUsersService } from './services/ranch-users.service';
import { RanchUsersController } from './controllers/ranch-users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RanchUser } from './entities/ranch-user.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([RanchUser]),
	],
	controllers: [RanchUsersController],
	providers: [RanchUsersService],
	exports: [RanchUsersService]
})
export class RanchUsersModule { }
