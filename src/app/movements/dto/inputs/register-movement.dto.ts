import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsBoolean,
    IsDateString,
    IsEnum,
    IsIn,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    Max,
    MaxLength,
    ValidateNested,
} from 'class-validator';
import { MovementTypeEnum } from 'src/modules/movement-modules/movements/entities/movement.entity';

export class PurchaseAnimalDataDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    @IsPositive()
    idBreed: number;

    @ApiProperty({ description: 'Animal class ID (chosen by the operator)', example: 8 })
    @IsInt()
    @IsPositive()
    idAnimalClass: number;

    @ApiProperty({ description: 'Unique tag/code within the ranch', example: 'COMP-001' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    code: string;

    @ApiProperty({ enum: ['F', 'M'], example: 'F' })
    @IsIn(['F', 'M'])
    sex: 'F' | 'M';

    @ApiProperty({ example: '2024-05-10' })
    @IsDateString()
    birthdate: Date;

    @ApiProperty({ example: 320.5, required: false })
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    @Max(9999.99)
    weight?: number;

    @ApiProperty({ description: 'Lot the purchased animal enters', required: false })
    @IsOptional()
    @IsInt()
    @IsPositive()
    idLot?: number;

    @ApiProperty({ description: 'Productive status at entry (1=Cría, 2=Recría, 3=Engorde)', required: false })
    @IsOptional()
    @IsInt()
    @IsPositive()
    @Max(3)
    idProductiveStatus?: number;
}

export class RegisterMovementAnimalDto {
    @ApiProperty({
        description: 'Existing animal ID. Required for sale/pasture_transfer/ranch_exit. Omit for purchase (the animal is created via newAnimal).',
        example: 4,
        required: false,
    })
    @IsOptional()
    @IsInt()
    @IsPositive()
    idRanchAnimal?: number;

    @ApiProperty({ description: 'Destination lot. Required only for pasture_transfer.', required: false })
    @IsOptional()
    @IsInt()
    @IsPositive()
    idLotDest?: number;

    @ApiProperty({
        description: 'New animal data. Required only for purchase — the server creates the ranch_animal with origin=purchased.',
        type: PurchaseAnimalDataDto,
        required: false,
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => PurchaseAnimalDataDto)
    newAnimal?: PurchaseAnimalDataDto;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    localId?: string;
}

export class RegisterMovementDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    @IsPositive()
    idRanch: number;

    @ApiProperty({ enum: MovementTypeEnum, example: MovementTypeEnum.PASTURE_TRANSFER })
    @IsEnum(MovementTypeEnum)
    movementType: MovementTypeEnum;

    @ApiProperty({ example: '2027-03-01' })
    @IsDateString()
    movementDate: Date;

    @ApiProperty({ description: 'sale: buyer name | ranch_exit: destination ranch name', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    counterpartName?: string;

    @ApiProperty({ description: 'purchase: supplier or origin ranch name', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    originName?: string;

    @ApiProperty({ description: 'Agreed total price (sale/purchase only)', required: false })
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    totalPrice?: number;

    @ApiProperty({ description: 'Price per kg (sale/purchase only)', required: false })
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    pricePerKg?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    localId?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    isSynced?: boolean;

    @ApiProperty({ description: 'Animals involved (minimum 1)', type: [RegisterMovementAnimalDto] })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => RegisterMovementAnimalDto)
    animals: RegisterMovementAnimalDto[];
}
