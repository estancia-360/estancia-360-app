import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vaccination } from './entities/vaccination.entity';
import { VaccinationsService } from './services/vaccinations.service';
import { VaccinationsController } from './controllers/vaccinations.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Vaccination])],
    controllers: [VaccinationsController],
    providers: [VaccinationsService],
    exports: [VaccinationsService],
})
export class VaccinationsModule {}
