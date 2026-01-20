import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../entities/user.entity";
import { Repository } from "typeorm";
import { CreateUserDto } from "../dto/create-user.dto";
import { UserDto } from "../dto/user.dto";
import { RolesService } from "src/modules/core/roles/services/roles.service";
import { UsersService } from "./users.service";
import { MyNotFoundException } from "src/shared/exceptions";
import { plainToInstance } from "class-transformer";
import { UpdateUserDto } from "../dto/update-user.dto";

@Injectable()
export class UsersAuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly usersService: UsersService,
        private readonly rolesService: RolesService,
    ) { }

    async create<T>(data: CreateUserDto,cls: new () => T): Promise<T>{
        const role = await this.rolesService.findOne(data.idRole);
        await this.validateEmailUnique(data.email.trim());
        await this.validateCiUnique(data.ci.trim());
        const user = new User();
        user.idRole = data.idRole;
        user.ci = data.ci;
        user.fullname = data.fullname.trim();
        user.paternalSurname = data.paternalSurname.trim();
        user.maternalSurname = data.maternalSurname.trim();
        user.email = data.email.trim();
        user.password = data.password.trim();
        if (data.celphone){
            user.celphone = data.celphone.trim();
        }
        const userSaved = await this.userRepository.save(user);
        return (await this.usersService.findOneById(userSaved.id,{
            throwException: true,
            template: cls,
            where: {
                isDeleted: false
            }
        }))!
    }

    async validateEmailUnique(email: string){
        const emailValid = await this.usersService.findOneByEmail<UserDto>(email.trim(),{
            throwException: false,
            template: UserDto,
            where: {
                isDeleted: false,
            }
        })
        if (emailValid) {
            throw new MyNotFoundException(`El usuarion con el email ${email} ya es encuentra registrado`);
        }
    }

    async validateCiUnique(ci: string){
        const emailValid = await this.usersService.findOneByCi<UserDto>(ci.trim(),{
            throwException: false,
            template: UserDto,
            where: {
                isDeleted: false
            }
        })
        if (emailValid) {
            throw new MyNotFoundException(`El usuarion con el CI ${ci} ya es encuentra registrado`);
        }
    }

    async updateByEmail(data: UpdateUserDto,user: User){        
        if (!user){
            throw new MyNotFoundException('No se encontro al usuario');
        }
        if (data.idRole){
            user.idRole = data.idRole
        }
        if (data.ci){
            user.ci = data.ci
        }
        if (data.fullname){
            user.fullname = data.fullname
        }
        if (data.paternalSurname){
            user.paternalSurname = data.paternalSurname;
        }
        if (data.maternalSurname){
            user.maternalSurname = data.maternalSurname;
        }
        if (data.email){
            user.email = data.email
        }
        if (data.password){
            user.password = data.password
        }
        if (data.celphone){
            user.celphone = data.celphone
        }
        return await this.userRepository.save(user);
    }
}