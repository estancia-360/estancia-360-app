import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RearingSelection } from './entities/rearing-selection.entity';
import { RearingSelectionsService } from './services/rearing-selections.service';
import { RearingSelectionsController } from './controllers/rearing-selections.controller';

@Module({
    imports: [TypeOrmModule.forFeature([RearingSelection])],
    controllers: [RearingSelectionsController],
    providers: [RearingSelectionsService],
    exports: [RearingSelectionsService],
})
export class RearingSelectionsModule {}
