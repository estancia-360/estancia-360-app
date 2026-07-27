import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnimalDeclaredHistory } from './entities/animal-declared-history.entity';
import { AnimalDeclaredHistoryService } from './services/animal-declared-history.service';
import { AnimalDeclaredHistoryController } from './controllers/animal-declared-history.controller';

@Module({
    imports: [TypeOrmModule.forFeature([AnimalDeclaredHistory])],
    controllers: [AnimalDeclaredHistoryController],
    providers: [AnimalDeclaredHistoryService],
    exports: [AnimalDeclaredHistoryService],
})
export class AnimalDeclaredHistoryModule {}
