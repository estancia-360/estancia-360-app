import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator';
import { CreateUserDto } from '../../../modules/user-management/users/dto/create-user.dto';

export class RegisterDto extends CreateUserDto {
}
