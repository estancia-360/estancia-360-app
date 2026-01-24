import { Module } from '@nestjs/common';
import { RanchRolesService } from './services/ranch-roles.service';
import { RanchRolesController } from './controllers/ranch-roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RanchRole } from './entities/ranch-role.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([RanchRole])
	],
	controllers: [RanchRolesController],
	providers: [RanchRolesService],
})
export class RanchRolesModule { }
