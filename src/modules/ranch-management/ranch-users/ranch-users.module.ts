import { Module } from '@nestjs/common';
import { RanchUsersService } from './services/ranch-users.service';
import { RanchUsersController } from './controllers/ranch-users.controller';

@Module({
  controllers: [RanchUsersController],
  providers: [RanchUsersService],
})
export class RanchUsersModule {}
