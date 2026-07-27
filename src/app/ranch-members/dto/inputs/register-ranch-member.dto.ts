import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export const RANCH_MEMBER_ROLES = ['worker', 'administrator'] as const;
export type RanchMemberRole = (typeof RANCH_MEMBER_ROLES)[number];

// El dueño de la estancia da de alta a alguien que todavía no tiene cuenta —
// se crea el usuario (rol global Usuario) y se lo vincula a la estancia con
// el rol elegido, nunca Owner (eso solo se asigna al crear la estancia).
export class RegisterRanchMemberDto {
    @ApiProperty({ description: 'Carnet de identidad del usuario', example: '12345678' })
    @IsString({ message: 'El CI debe ser texto' })
    @IsNotEmpty({ message: 'El CI es obligatorio' })
    @Length(5, 20, { message: 'El CI debe tener entre 5 y 20 caracteres' })
    ci: string;

    @ApiProperty({ example: 'Juan Carlos Pérez' })
    @IsString()
    @IsNotEmpty({ message: 'El nombre completo es obligatorio' })
    @Length(3, 150)
    fullname: string;

    @ApiProperty({ example: 'Pérez' })
    @IsString()
    @IsNotEmpty({ message: 'El apellido paterno es obligatorio' })
    @Length(2, 100)
    paternalSurname: string;

    @ApiProperty({ example: 'Gómez' })
    @IsString()
    @IsNotEmpty({ message: 'El apellido materno es obligatorio' })
    @Length(2, 100)
    maternalSurname: string;

    @ApiProperty({ example: 'trabajador@estancia360.com' })
    @IsEmail({}, { message: 'El correo no es válido' })
    @IsNotEmpty({ message: 'El correo es obligatorio' })
    email: string;

    @ApiProperty({ example: 'Password123!' })
    @IsString()
    @IsNotEmpty({ message: 'La contraseña es obligatoria' })
    @Length(8, 255, { message: 'La contraseña debe tener al menos 8 caracteres' })
    password: string;

    @ApiProperty({ required: false, example: '78945612' })
    @IsOptional()
    @IsString()
    @Length(6, 20)
    celphone?: string;

    @ApiProperty({ enum: RANCH_MEMBER_ROLES, example: 'worker' })
    @IsIn(RANCH_MEMBER_ROLES, { message: 'ranchRole debe ser worker o administrator' })
    ranchRole: RanchMemberRole;
}
