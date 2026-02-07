import { Injectable } from '@nestjs/common';
import { CreateAnimalBreedDto } from '../dto/create-animal-breed.dto';
import { UpdateAnimalBreedDto } from '../dto/update-animal-breed.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AnimalBreed } from '../entities/animal-breed.entity';
import { Repository } from 'typeorm';
import { OptionsFindDto } from 'src/shared/dto/options-find.dto';
import { AnimalBreedDto } from '../dto/animal-breed.dto';
import { findWithAutoMapper } from 'src/infrastructure/database/utils';
import { MyNotFoundException } from 'src/shared/exceptions';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class AnimalBreedsService {
	constructor(
		@InjectRepository(AnimalBreed)
		private readonly animalBreedRepository: Repository<AnimalBreed>
	) { }

	async findOneById<T>(idBreed: number, optionsData: OptionsFindDto<T, AnimalBreed>): Promise<T | null> {
		const options = Object.assign(new OptionsFindDto(), optionsData)
		const templateClass = options.template ? options.template : (AnimalBreedDto as unknown as new () => T)
		let template = findWithAutoMapper(templateClass);
		const breed = await this.animalBreedRepository.findOne({
			where: {
				id: idBreed,
				...(options.where ? options.where : {}),
			},
			select: template.select,
			relations: template.relations
		}) as T
		if (!breed && options.throwException === true) {
			throw new MyNotFoundException(`La raza del animal con ID = ${idBreed} no fue encontrado.`);
		}
		if (!breed) {
			return null;
		}
		return plainToInstance(templateClass, breed, { excludeExtraneousValues: true });
	}

	async findAll<T>(optionsData: OptionsFindDto<T, AnimalBreed>): Promise<AnimalBreedDto[]>{
		const template = findWithAutoMapper(AnimalBreedDto)
		const options = Object.assign(new OptionsFindDto(), optionsData)
		const breeds = await this.animalBreedRepository.find({
			...template,
			where: {
				...(options.where ? options.where : {}),
			}
		})
		return plainToInstance(AnimalBreedDto,breeds, {excludeExtraneousValues: true });
	}
}
