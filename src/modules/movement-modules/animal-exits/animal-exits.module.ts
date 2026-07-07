import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnimalExit } from './entities/animal-exit.entity';
import { AnimalExitsService } from './services/animal-exits.service';
import { AnimalExitsController } from './controllers/animal-exits.controller';

@Module({
    imports: [TypeOrmModule.forFeature([AnimalExit])],
    controllers: [AnimalExitsController],
    providers: [AnimalExitsService],
    exports: [AnimalExitsService],
})
export class AnimalExitsModule {}
