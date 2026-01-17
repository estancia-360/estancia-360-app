import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '../entities/role.entity';
import { Repository } from 'typeorm';
import { OptionsFindDto } from 'src/shared/dto/options-find.dto';
import { RoleNotFoundException } from '../exceptions/role-not-found.exception';

@Injectable()
export class RolesService {
	constructor(
		@InjectRepository(Role)
		private readonly roleRepository: Repository<Role>
	) { }

	async findOne(idRole: number,optionsData?: OptionsFindDto): Promise<Role | null>{
		const options = Object.assign(new OptionsFindDto,optionsData);
		const role = await this.roleRepository.findOne({
			where: {
				id: idRole
			}
		})
		if (!role && optionsData && options.throwException === true){
			throw new RoleNotFoundException();
		}
		return role;
	}

	async findAll(){
		const roles = await this.roleRepository.find({
			order: {
				id: 'ASC'
			}
		})
		return roles
	}
}
