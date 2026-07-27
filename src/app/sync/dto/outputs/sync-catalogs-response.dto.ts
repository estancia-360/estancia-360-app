import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class AnimalClassCatalogDto {
    @ApiProperty() @Expose() @Type(() => Number) id: number;
    @ApiProperty() @Expose() name: string;
    @ApiProperty() @Expose() sex: 'F' | 'M';
    @ApiProperty() @Expose() isActive: boolean;
}

export class AnimalBreedCatalogDto {
    @ApiProperty() @Expose() @Type(() => Number) id: number;
    @ApiProperty() @Expose() name: string;
    @ApiProperty() @Expose() isActive: boolean;
}

export class AnimalStatusCatalogDto {
    @ApiProperty() @Expose() @Type(() => Number) id: number;
    @ApiProperty() @Expose() name: string;
    @ApiProperty() @Expose() isActive: boolean;
}

export class EventTypeCatalogDto {
    @ApiProperty() @Expose() @Type(() => Number) id: number;
    @ApiProperty() @Expose() name: string;
    @ApiProperty() @Expose() isActive: boolean;
}

export class ProductiveStatusCatalogDto {
    @ApiProperty() @Expose() @Type(() => Number) id: number;
    @ApiProperty() @Expose() name: string;
    @ApiProperty() @Expose() isActive: boolean;
}

export class ProductionTypeCatalogDto {
    @ApiProperty() @Expose() @Type(() => Number) id: number;
    @ApiProperty() @Expose() name: string;
    @ApiProperty() @Expose() isActive: boolean;
}

export class SyncCatalogsResponseDto {
    @ApiProperty({ type: [AnimalClassCatalogDto] }) animalClasses: AnimalClassCatalogDto[];
    @ApiProperty({ type: [AnimalBreedCatalogDto] }) animalBreeds: AnimalBreedCatalogDto[];
    @ApiProperty({ type: [AnimalStatusCatalogDto] }) animalStatuses: AnimalStatusCatalogDto[];
    @ApiProperty({ type: [EventTypeCatalogDto] }) eventTypes: EventTypeCatalogDto[];
    @ApiProperty({ type: [ProductiveStatusCatalogDto] }) productiveStatuses: ProductiveStatusCatalogDto[];
    @ApiProperty({ type: [ProductionTypeCatalogDto] }) productionTypes: ProductionTypeCatalogDto[];
}
