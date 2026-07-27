import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

// Same fields as CreateUserDto minus roleId — the caller can never choose the
// role, it's always ADMIN (see AdminUsersController). Mirrors the pattern
// already used by CreateRanchUserWorkerDto (always WORKER, never client-chosen).
export class CreateAdminUserDto {
    @ApiProperty({ description: 'Carnet de identidad del usuario', example: '12345678' })
    @IsString({ message: 'El CI debe ser texto' })
    @IsNotEmpty({ message: 'El CI es obligatorio' })
    @Length(5, 20, { message: 'El CI debe tener entre 5 y 20 caracteres' })
    ci: string;

    @ApiProperty({ description: 'Nombre completo del usuario', example: 'Juan Carlos Pérez' })
    @IsString({ message: 'El nombre completo debe ser texto' })
    @IsNotEmpty({ message: 'El nombre completo es obligatorio' })
    @Length(3, 150, { message: 'El nombre completo es muy corto o muy largo' })
    fullname: string;

    @ApiProperty({ description: 'Apellido paterno', example: 'Pérez' })
    @IsString({ message: 'El apellido paterno debe ser texto' })
    @IsNotEmpty({ message: 'El apellido paterno es obligatorio' })
    @Length(2, 100)
    paternalSurname: string;

    @ApiProperty({ description: 'Apellido materno', example: 'Gómez' })
    @IsString({ message: 'El apellido materno debe ser texto' })
    @IsNotEmpty({ message: 'El apellido materno es obligatorio' })
    @Length(2, 100)
    maternalSurname: string;

    @ApiProperty({ description: 'Correo electrónico del usuario', example: 'admin@estancia360.com' })
    @IsEmail({}, { message: 'El correo no es válido' })
    @IsNotEmpty({ message: 'El correo es obligatorio' })
    email: string;

    @ApiProperty({ description: 'Contraseña del usuario', example: 'Password123!' })
    @IsString({ message: 'La contraseña debe ser texto' })
    @IsNotEmpty({ message: 'La contraseña es obligatoria' })
    @Length(8, 255, { message: 'La contraseña debe tener al menos 8 caracteres' })
    password: string;

    @ApiProperty({ description: 'Número de celular', example: '78945612', required: false })
    @IsOptional()
    @IsString({ message: 'El celular debe ser texto' })
    @Length(6, 20, { message: 'El número de celular no es válido' })
    celphone?: string;
}
