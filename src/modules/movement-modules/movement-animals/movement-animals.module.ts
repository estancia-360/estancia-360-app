import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovementAnimal } from './entities/movement-animal.entity';
import { MovementAnimalsService } from './services/movement-animals.service';

// Sin controller propio — se consulta siempre anidado dentro de MovementDto.animals
// (GET /movements/:id). Las mutaciones por animal viven en app/movements
// (confirm/cancel), nunca directo contra este módulo.
@Module({
    imports: [TypeOrmModule.forFeature([MovementAnimal])],
    providers: [MovementAnimalsService],
    exports: [MovementAnimalsService],
})
export class MovementAnimalsModule {}
