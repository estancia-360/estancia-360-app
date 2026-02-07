import { Injectable } from '@nestjs/common';
import { CreateAnimalStatusDto } from '../dto/create-animal-status.dto';
import { UpdateAnimalStatusDto } from '../dto/update-animal-status.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AnimalStatus } from '../entities/animal-status.entity';
import { Repository } from 'typeorm';
import { OptionsFindDto } from 'src/shared/dto/options-find.dto';
import { AnimalStatusDto } from '../dto/animal-status.dto';
import { findWithAutoMapper } from 'src/infrastructure/database/utils';
import { MyNotFoundException } from 'src/shared/exceptions';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class AnimalStatusesService {
	constructor(
		@InjectRepository(AnimalStatus)
		private readonly animalStatusRepository: Repository<AnimalStatus>
	) { }

	async findOneById<T>(idStatus: number, optionsData: OptionsFindDto<T, AnimalStatus>): Promise<T | null> {
		const options = Object.assign(new OptionsFindDto(), optionsData)
		const templateClass = options.template ? options.template : (AnimalStatusDto as unknown as new () => T)
		let template = findWithAutoMapper(templateClass);
		const status = await this.animalStatusRepository.findOne({
			where: {
				id: idStatus,
				...(options.where ? options.where : {}),
			},
			select: template.select,
			relations: template.relations
		}) as T
		if (!status && options.throwException === true) {
			throw new MyNotFoundException(`El estado del animl con ID = ${idStatus} no fue encontrado.`);
		}
		if (!status) {
			return null;
		}
		return plainToInstance(templateClass, status, { excludeExtraneousValues: true });
	}

	async findAll<T>(optionsData: OptionsFindDto<T, AnimalStatus>) {
		const template = findWithAutoMapper(AnimalStatusDto)
		const options = Object.assign(new OptionsFindDto(), optionsData)
		const breeds = await this.animalStatusRepository.find({
			...template,
			where: {
				...(options.where ? options.where : {}),
			}
		})
		return breeds;
	}
}
