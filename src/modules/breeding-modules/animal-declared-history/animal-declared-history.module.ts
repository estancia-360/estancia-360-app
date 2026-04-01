import { Module } from '@nestjs/common';
import { AnimalDeclaredHistoryService } from './services/animal-declared-history.service';
import { AnimalDeclaredHistoryController } from './controllers/animal-declared-history.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnimalDeclaredHistory } from './entities/animal-declared-history.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([AnimalDeclaredHistory]),
    ],
    controllers: [AnimalDeclaredHistoryController],
    providers: [AnimalDeclaredHistoryService],
    exports: [AnimalDeclaredHistoryService],
})
export class AnimalDeclaredHistoryModule {}
