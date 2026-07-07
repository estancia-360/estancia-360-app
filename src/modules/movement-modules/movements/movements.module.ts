import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movement } from './entities/movement.entity';
import { MovementsService } from './services/movements.service';
import { MovementsController } from './controllers/movements.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Movement])],
    controllers: [MovementsController],
    providers: [MovementsService],
    exports: [MovementsService],
})
export class MovementsModule {}
