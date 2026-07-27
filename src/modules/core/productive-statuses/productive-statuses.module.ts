import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductiveStatus } from './entities/productive-status.entity';
import { ProductiveStatusesService } from './services/productive-statuses.service';

@Module({
    imports:   [TypeOrmModule.forFeature([ProductiveStatus])],
    providers: [ProductiveStatusesService],
    exports:   [ProductiveStatusesService],
})
export class ProductiveStatusesModule {}
