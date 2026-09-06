import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';
import { PASSWORD_COMPLEXITY_REGEX, PASSWORD_COMPLEXITY_MESSAGE } from 'src/shared/constants';

/**
 * No extiende CreateUserDto: el auto-registro nunca debe poder elegir roleId
 * (AuthService.register lo fuerza a RoleEnum.USER). CreateUserDto sigue
 * usándose tal cual para el alta administrativa de usuarios, que sí necesita
 * roleId.
 */
export class RegisterDto {
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

    @ApiProperty({ description: 'Correo electrónico del usuario', example: 'usuario@email.com' })
    @IsEmail({}, { message: 'El correo no es válido' })
    @IsNotEmpty({ message: 'El correo es obligatorio' })
    email: string;

    @ApiProperty({ description: 'Contraseña del usuario', example: 'Password123!' })
    @IsString({ message: 'La contraseña debe ser texto' })
    @IsNotEmpty({ message: 'La contraseña es obligatoria' })
    @Length(8, 255, { message: 'La contraseña debe tener al menos 8 caracteres' })
    @Matches(PASSWORD_COMPLEXITY_REGEX, { message: PASSWORD_COMPLEXITY_MESSAGE })
    password: string;

    @ApiProperty({ description: 'Número de celular', example: '78945612', required: false })
    @IsOptional()
    @IsString({ message: 'El celular debe ser texto' })
    @Length(6, 20, { message: 'El número de celular no es válido' })
    celphone?: string;
}
