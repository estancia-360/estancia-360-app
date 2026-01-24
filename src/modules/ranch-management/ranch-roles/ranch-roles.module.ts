import { Module } from '@nestjs/common';
import { RanchRolesService } from './services/ranch-roles.service';
import { RanchRolesController } from './controllers/ranch-roles.controller';

@Module({
  controllers: [RanchRolesController],
  providers: [RanchRolesService],
})
export class RanchRolesModule {}
