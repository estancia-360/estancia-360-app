import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovementAnimal } from './entities/movement-animal.entity';
import { MovementAnimalsService } from './services/movement-animals.service';

@Module({
    imports: [TypeOrmModule.forFeature([MovementAnimal])],
    providers: [MovementAnimalsService],
    exports: [MovementAnimalsService],
})
export class MovementAnimalsModule {}
