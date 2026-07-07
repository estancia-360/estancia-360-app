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
    @ApiProperty({ description: 'ID de la raza', example: 1 })
    @IsInt()
    @IsPositive()
    idBreed: number;

    @ApiProperty({ description: 'ID de la clase del animal (elegida por el operador)', example: 8 })
    @IsInt()
    @IsPositive()
    idAnimalClass: number;

    @ApiProperty({ description: 'Código caravana único en la estancia', example: 'COMP-001' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    code: string;

    @ApiProperty({ description: 'Sexo (F/M)', example: 'F' })
    @IsIn(['F', 'M'])
    sex: 'F' | 'M';

    @ApiProperty({ description: 'Fecha de nacimiento', example: '2024-05-10' })
    @IsDateString()
    birthdate: Date;

    @ApiProperty({ description: 'Peso en kg (máx 9999.99)', example: 320.5, required: false })
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    @Max(9999.99)
    weight?: number;

    @ApiProperty({ description: 'Lote donde ingresa el animal comprado', required: false })
    @IsOptional()
    @IsInt()
    @IsPositive()
    idLot?: number;

    @ApiProperty({ description: 'Estado productivo con el que ingresa (1=Cría, 2=Recría, 3=Engorde)', required: false })
    @IsOptional()
    @IsInt()
    @IsPositive()
    @Max(3)
    idProductiveStatus?: number;
}

export class RegisterMovementAnimalDto {
    @ApiProperty({
        description: 'ID del animal existente. Obligatorio para sale/pasture_transfer/ranch_exit. NO enviar en purchase (el animal se crea nuevo con newAnimal).',
        example: 4,
        required: false,
    })
    @IsOptional()
    @IsInt()
    @IsPositive()
    idRanchAnimal?: number;

    @ApiProperty({ description: 'Lote destino. Obligatorio solo para pasture_transfer.', required: false })
    @IsOptional()
    @IsInt()
    @IsPositive()
    idLotDest?: number;

    @ApiProperty({
        description: 'Datos del animal nuevo. Obligatorio solo para purchase — el servidor crea el ranch_animal con origin=purchased.',
        type: PurchaseAnimalDataDto,
        required: false,
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => PurchaseAnimalDataDto)
    newAnimal?: PurchaseAnimalDataDto;

    @ApiProperty({ description: 'Observación por animal', required: false })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({ description: 'UUID de idempotencia offline de este detalle', required: false })
    @IsOptional()
    @IsString()
    localId?: string;
}

export class RegisterMovementDto {
    @ApiProperty({ description: 'ID de la estancia', example: 1 })
    @IsInt()
    @IsPositive()
    idRanch: number;

    @ApiProperty({ description: 'ID del usuario que registra. Debe ser Owner (ranch_role=1) para sale/purchase/ranch_exit.', example: 1 })
    @IsInt()
    @IsPositive()
    idUser: number;

    @ApiProperty({ description: 'Tipo de movimiento', enum: MovementTypeEnum, example: MovementTypeEnum.PASTURE_TRANSFER })
    @IsEnum(MovementTypeEnum)
    movementType: MovementTypeEnum;

    @ApiProperty({ description: 'Fecha efectiva de la operación (YYYY-MM-DD)', example: '2027-03-01' })
    @IsDateString()
    movementDate: Date;

    @ApiProperty({ description: 'sale: nombre del comprador | ranch_exit: nombre de la estancia destino', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    counterpartName?: string;

    @ApiProperty({ description: 'purchase: nombre del proveedor o estancia de origen', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    originName?: string;

    @ApiProperty({ description: 'Precio total acordado (solo sale/purchase)', required: false })
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    totalPrice?: number;

    @ApiProperty({ description: 'Precio por kg (solo sale/purchase)', required: false })
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    pricePerKg?: number;

    @ApiProperty({ description: 'Observaciones de la operación', required: false })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({ description: 'UUID de idempotencia offline del movimiento', required: false })
    @IsOptional()
    @IsString()
    localId?: string;

    @ApiProperty({ description: 'Indica si fue registrado offline', required: false })
    @IsOptional()
    @IsBoolean()
    isSynced?: boolean;

    @ApiProperty({ description: 'Animales involucrados (mínimo 1)', type: [RegisterMovementAnimalDto] })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => RegisterMovementAnimalDto)
    animals: RegisterMovementAnimalDto[];
}
