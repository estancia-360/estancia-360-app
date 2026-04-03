import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { OptionsFindDto } from 'src/shared/dto/options-find.dto';
import { plainToInstance } from 'class-transformer';
import { findWithAutoMapper } from 'src/infrastructure/database/utils';
import { UserNotFoundByCiException, UserNotFoundByEmailException, UserNotFoundByIdException } from '../exceptions/user-not-found.exception';
import { UserDto } from '../dto/user.dto';
import { UserWithRanchesDto } from '../dto/user-with-ranches.dto';
import { RanchRolesEnum } from 'src/shared/enums';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>
	) { }

	async findOneById<T>(idUser: number, optionsData: OptionsFindDto<T, User>): Promise<T | null> {
		const options = Object.assign(new OptionsFindDto(), optionsData)
		const templateClass = options.template ? options.template : (UserDto as unknown as new () => T)
		let template = findWithAutoMapper(templateClass);
		const user = await this.userRepository.findOne({
			where: {
				id: idUser,
				...(options.where ? options.where : {}),
			},
			select: template.select,
			relations: template.relations
		}) as T
		if (!user && options.throwException === true) {
			throw new UserNotFoundByIdException(idUser);
		}
		if (!user) {
			return null;
		}
		return plainToInstance(templateClass, user, { excludeExtraneousValues: true });
	}

	async findOneByEmail<T>(email: string, optionsData?: OptionsFindDto<T,User>): Promise<T | null> {
		const options = Object.assign(new OptionsFindDto(), optionsData)
		const templateClass = options.template ? options.template : (UserDto as unknown as new () => T)
		let template = findWithAutoMapper(templateClass);
		const user = await this.userRepository.findOne({
			where: {
				email: email,
				...(options.where ? options.where : {}),
			},
			select: template.select,
			relations: template.relations
		}) as T
		if (!user && options.throwException) {
			throw new UserNotFoundByEmailException(email);
		}
		if (!user) return null;
		return plainToInstance(templateClass, user, { excludeExtraneousValues: true });
	}

	async findOneByCi<T>(ci: string, optionsData?: OptionsFindDto<T,User>): Promise<T | null> {
		const options = Object.assign(new OptionsFindDto(), optionsData)
		const templateClass = options.template ? options.template : (UserDto as unknown as new () => T)
		let template = findWithAutoMapper(templateClass);
		const user = await this.userRepository.findOne({
			where: {
				ci: ci,
				...(options.where ? options.where : {}),
			},
			select: template.select,
			relations: template.relations
		}) as T
		if (!user && options.throwException) {
			throw new UserNotFoundByCiException(ci);
		}
		if (!user) return null;
		return plainToInstance(templateClass, user, { excludeExtraneousValues: true });
	}

	async findOneUserWithRanches(idUser: number){
		let template = findWithAutoMapper(UserWithRanchesDto);
		const ranchUsers = await this.userRepository.findOne({
			...template,
			where: {
				id: idUser,
			}
		})
		return ranchUsers;
	}

	/**
	 * Obtiene el ID de la estancia donde el usuario es OWNER.
	 * Usa QueryBuilder para una consulta eficiente y directa.
	 * 
	 * @param idUser - ID del usuario
	 * @returns idRanch si es dueño, null si no es dueño de ninguna estancia
	 */
	async findRanchIdWhereUserIsOwner(idUser: number): Promise<number | null> {
		const result = await this.userRepository
			.createQueryBuilder('u')
			.innerJoin('u.ranchUsers', 'ru', 'ru.idRole = :ownerRole', { ownerRole: RanchRolesEnum.OWNER })
			.select('ru.idRanch', 'idRanch')
			.where('u.id = :idUser', { idUser })
			.getRawOne();
		
		return result ? result.idRanch : null;
	}
}