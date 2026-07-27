import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BreedingService } from './entities/breeding-service.entity';
import { BreedingServicesService } from './services/breeding-services.service';
import { BreedingServicesController } from './controllers/breeding-services.controller';

@Module({
    imports: [TypeOrmModule.forFeature([BreedingService])],
    controllers: [BreedingServicesController],
    providers: [BreedingServicesService],
    exports: [BreedingServicesService],
})
export class BreedingServicesModule {}
