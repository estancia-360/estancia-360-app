import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movement } from './entities/movement.entity';
import { MovementsService } from './services/movements.service';
import { MovementsController } from './controllers/movements.controller';
import { RanchUsersModule } from 'src/modules/ranch-management/ranch-users/ranch-users.module';

@Module({
    imports: [TypeOrmModule.forFeature([Movement]), RanchUsersModule],
    controllers: [MovementsController],
    providers: [MovementsService],
    exports: [MovementsService],
})
export class MovementsModule {}
