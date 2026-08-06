import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vaccination } from './entities/vaccination.entity';
import { VaccinationsService } from './services/vaccinations.service';
import { VaccinationsController } from './controllers/vaccinations.controller';
import { RanchAnimalsModule } from 'src/modules/ranch-management/ranch-animals/ranch-animals.module';
import { RanchUsersModule } from 'src/modules/ranch-management/ranch-users/ranch-users.module';

@Module({
    imports: [TypeOrmModule.forFeature([Vaccination]), RanchAnimalsModule, RanchUsersModule],
    controllers: [VaccinationsController],
    providers: [VaccinationsService],
    exports: [VaccinationsService],
})
export class VaccinationsModule {}
