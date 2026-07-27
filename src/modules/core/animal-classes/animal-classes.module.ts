import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnimalClass } from './entities/animal-class.entity';
import { AnimalClassesService } from './services/animal-classes.service';
import { AnimalClassesController } from './controllers/animal-classes.controller';

@Module({
    imports: [TypeOrmModule.forFeature([AnimalClass])],
    controllers: [AnimalClassesController],
    providers: [AnimalClassesService],
    exports: [AnimalClassesService],
})
export class AnimalClassesModule {}
