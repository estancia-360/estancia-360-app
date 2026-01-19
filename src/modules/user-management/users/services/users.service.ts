import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { OptionsFindDto } from 'src/shared/dto/options-find.dto';
import { plainToInstance } from 'class-transformer';
import { findWithAutoMapper } from 'src/infrastructure/database/utils';
import { UserNotFoundByEmailException, UserNotFoundByIdException } from '../exceptions/user-not-found.exception';
import { UserDto } from '../dto/user.dto';

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
}