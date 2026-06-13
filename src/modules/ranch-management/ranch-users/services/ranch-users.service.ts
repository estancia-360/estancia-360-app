import { Injectable } from '@nestjs/common';
import { CreateRanchUserDto } from '../dto/create-ranch-user.dto';
import { UpdateRanchUserDto } from '../dto/update-ranch-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RanchUser } from '../entities/ranch-user.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/modules/user-management/users/services/users.service';
import { RanchRolesEnum } from 'src/shared/enums';
import { OptionsFindDto } from 'src/shared/dto/options-find.dto';
import { findWithAutoMapper } from 'src/infrastructure/database/utils';

@Injectable()
export class RanchUsersService {
	constructor(
		@InjectRepository(RanchUser)
		private readonly ranchUserRepository: Repository<RanchUser>,
	) { }

	async create<T>(data: CreateRanchUserDto) {
		const ranchUser = new RanchUser();
		ranchUser.idRanch = data.idRanch;
		ranchUser.idUser = data.idUser;
		ranchUser.idRole = data.idRanchRole
		return await this.ranchUserRepository.save(ranchUser);
	}

	async findByUser(idUser: number): Promise<RanchUser[]> {
		return await this.ranchUserRepository.find({
			where: { idUser },
			relations: { ranch: true, role: true },
		});
	}

	async findOne(idUser: number, idRanch: number): Promise<RanchUser | null> {
		return await this.ranchUserRepository.findOne({
			where: { idUser, idRanch },
		});
	}
}
