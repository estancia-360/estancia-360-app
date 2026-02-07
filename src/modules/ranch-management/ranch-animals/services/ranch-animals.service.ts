import { Injectable } from '@nestjs/common';
import { CreateRanchAnimalDto } from '../dto/create-ranch-animal.dto';
import { UpdateRanchAnimalDto } from '../dto/update-ranch-animal.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RanchAnimal } from '../entities/ranch-animal.entity';
import { Like, Repository } from 'typeorm';
import { AnimalStatusesService } from '../../animal-statuses/services/animal-statuses.service';
import { AnimalBreedsService } from '../../animal-breeds/services/animal-breeds.service';
import { OptionsFindDto } from 'src/shared/dto/options-find.dto';
import { RanchAnimalDto } from '../dto/ranch-animal.dto';
import { findWithAutoMapper } from 'src/infrastructure/database/utils';
import { RanchAnimalNotFoundException } from '../exceptions';
import { plainToInstance } from 'class-transformer';
import { AnimalStatusDto } from '../../animal-statuses/dto/animal-status.dto';
import { RanchesService } from '../../ranches/services/ranches.service';
import { RanchDto } from '../../ranches/dto/ranch.dto';
import { AnimalBreedDto } from '../../animal-breeds/dto/animal-breed.dto';
import { FindAllRanchAnimalsParamsDto } from '../dto/inputs/find-all-ranch-animals-params.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';

@Injectable()
export class RanchAnimalsService {
	constructor(
		@InjectRepository(RanchAnimal)
		private readonly ranchAnimalRepository: Repository<RanchAnimal>,
		private readonly ranchesService: RanchesService,
		private readonly animalStatusesService: AnimalStatusesService,
		private readonly animalBreedsService: AnimalBreedsService,
	) { }

	async create<T>(data: CreateRanchAnimalDto, cls: new () => T): Promise<T> {
		const ranch = await this.ranchesService.findOneById(data.idRanch, {
			template: RanchDto,
			throwException: true,
		})

		const status = await this.animalStatusesService.findOneById(data.idStatus, {
			where: {
				isActive: true,
			},
			template: AnimalStatusDto,
			throwException: true,
		})

		const breed = await this.animalBreedsService.findOneById(data.idBreed, {
			where: {
				isActive: true,
			},
			template: AnimalBreedDto,
			throwException: true,
		})

		const ranchAnimal = new RanchAnimal();
		ranchAnimal.idRanch = ranch!.id;
		ranchAnimal.idStatus = status!.id;
		ranchAnimal.idBreed = breed!.id
		ranchAnimal.code = data.code;
		ranchAnimal.birthdate = data.birthdate;
		if (data.weight) { ranchAnimal.weight = data.weight }
		ranchAnimal.sex = data.sex;
		if (data.isCastrated === false || data.isCastrated === true) { ranchAnimal.isCastrated = data.isCastrated }
		if (data.isCastrated === false || data.isCastrated === true) { ranchAnimal.isCastrated = data.isCastrated }
		if (data.isCastrated === false || data.isCastrated === true) { ranchAnimal.isCastrated = data.isCastrated }
		ranchAnimal.createdAt = data.createdAt;
		const animalSaved = await this.ranchAnimalRepository.save(ranchAnimal);
		return (await this.findOneById(animalSaved.id, {
			throwException: true,
			template: cls,
		}))!
	}

	async findOneById<T>(idRanchAnimal: number, optionsData: OptionsFindDto<T, RanchAnimal>): Promise<T | null> {
		const options = Object.assign(new OptionsFindDto(), optionsData)
		const templateClass = options.template ? options.template : (RanchAnimalDto as unknown as new () => T)
		let template = findWithAutoMapper(templateClass);
		const animal = await this.ranchAnimalRepository.findOne({
			where: {
				id: idRanchAnimal,
				...(options.where ? options.where : {}),
			},
			select: template.select,
			relations: template.relations
		}) as T
		if (!animal && options.throwException === true) {
			throw new RanchAnimalNotFoundException(idRanchAnimal);
		}
		if (!animal) {
			return null;
		}
		return plainToInstance(templateClass, animal, { excludeExtraneousValues: true });
	}

	async findAll<T>(idRanch: number, data: FindAllRanchAnimalsParamsDto, optionsData: OptionsFindDto<T>): Promise<PaginationResponseDto<T>> {
		const options = Object.assign(new OptionsFindDto(), optionsData)
		const templateClass = options.template ? options.template : (RanchAnimalDto as unknown as new () => T)
		let template = findWithAutoMapper(templateClass);
		const { page, limit } = data;
		const [animals, total] = await this.ranchAnimalRepository.findAndCount({
			select: template.select,
			relations: template.relations,
			where: {
				idRanch: idRanch,
				...(data.idBreed ? {
					idBreed: data.idBreed
				} : {}),
				...(data.idStatus ? {
					idStatus: data.idStatus
				} : {}),
				...(data.code ? {
					code: Like(`%${data.code}%`)
				} : {}),
				...(data.birthdate ? {
					birthdate: data.birthdate
				} : {}),
				...(data.weight ? {
					weight: data.weight
				} : {}),
				...(data.sex ? {
					sex: data.sex
				} : {}),
				...(data.createdAt ? {
					createdAt: data.createdAt
				} : {}),
				...(data.isCastrated === undefined ? {}:{
					isCastrated: data.isCastrated
				}),
				...(data.isSterilized === undefined ? {}:{
					isSterilized: data.isSterilized
				}),
				...(data.hasCalved === undefined ? {}:{
					hasCalved: data.hasCalved
				}),
			},
			skip: (page - 1) * limit,
			take: limit
		}) as [T[], number]
		const dataResult = plainToInstance(templateClass, animals);
		return {
			data: dataResult,
			meta: {
				page: page,
				limit: limit,
				pages: Math.ceil(total / limit),
				total: total,
			}
		}
	}
}
