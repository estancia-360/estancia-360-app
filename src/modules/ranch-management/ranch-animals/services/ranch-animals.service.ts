import { Injectable } from '@nestjs/common';
import { CreateRanchAnimalDto } from '../dto/create-ranch-animal.dto';
import { UpdateRanchAnimalDto } from '../dto/update-ranch-animal.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RanchAnimal } from '../entities/ranch-animal.entity';
import { EntityManager, Like, Repository } from 'typeorm';
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
import { RanchAnimalNotFoundByCodeException } from '../exceptions/ranch-animal-not-found-by-code.exception';
import { RanchAnimalPlainDto } from '../dto/ranch-animal-plain.dto';
import { MyConflictException, MyNotFoundException } from 'src/shared/exceptions';

@Injectable()
export class RanchAnimalsService {
	constructor(
		@InjectRepository(RanchAnimal)
		private readonly ranchAnimalRepository: Repository<RanchAnimal>,
		private readonly ranchesService: RanchesService,
		private readonly animalStatusesService: AnimalStatusesService,
		private readonly animalBreedsService: AnimalBreedsService,
	) { }

	async update<T>(id: number,data: UpdateRanchAnimalDto, cls: new () => T): Promise<T> {

		if ((data.codeFather && data.codeMother) && (data.codeFather === data.codeMother)){
			throw new MyConflictException('El padre y la madre no pueden tenrer el mismo codigo.');
		}

		const ranchAnimal = await this.ranchAnimalRepository.findOne({
			where: {
				id: id
			}
		});
		if (!ranchAnimal) throw new MyNotFoundException('El animal no fue encontrado');
		if (data.codeMother){
			ranchAnimal.idMother = (await this.findOneByCode(data.codeMother,{
				throwException: true,
				template: RanchAnimalPlainDto
			}))!.id;
		}
		if (data.codeFather){
			ranchAnimal.idFather = (await this.findOneByCode(data.codeFather,{
				throwException: true,
				template: RanchAnimalPlainDto
			}))!.id;
		}
		if (data.idRanch){
			const ranch = await this.ranchesService.findOneById(data.idRanch, {
				template: RanchDto,
				throwException: true,
			})
			ranchAnimal.idRanch = ranch!.id;
		}
		
		if (data.idStatus){
			const status = await this.animalStatusesService.findOneById(data.idStatus, {
				where: {
					isActive: true,
				},
				template: AnimalStatusDto,
				throwException: true,
			})
			ranchAnimal.idStatus = status!.id;
		}

		if (data.idBreed){
			const breed = await this.animalBreedsService.findOneById(data.idBreed, {
				where: {
					isActive: true,
				},
				template: AnimalBreedDto,
				throwException: true,
			})
			ranchAnimal.idBreed = breed!.id
		}
		
		if (data.code){
			const existCode = await this.findOneByCode(data.code,{
				throwException: false,
				template: RanchAnimalPlainDto
			})
			if (existCode){
				throw new MyConflictException('El codigo del animal a crear ya se encuentra en uso')
			}
			ranchAnimal.code = data.code;
		}
		if (data.birthdate)	ranchAnimal.birthdate = data.birthdate;
		if (data.weight) { ranchAnimal.weight = data.weight }
		if (data.sex) ranchAnimal.sex = data.sex;
		if (data.isCastrated === false || data.isCastrated === true) { ranchAnimal.isCastrated = data.isCastrated }
		if (data.isCastrated === false || data.isCastrated === true) { ranchAnimal.isCastrated = data.isCastrated }
		if (data.isCastrated === false || data.isCastrated === true) { ranchAnimal.isCastrated = data.isCastrated }
		if (data.createdAt) ranchAnimal.createdAt = data.createdAt;
		const animalSaved = await this.ranchAnimalRepository.save(ranchAnimal);
		return (await this.findOneById(animalSaved.id, {
			throwException: true,
			template: cls,
		}))!
	}

	async create<T>(data: CreateRanchAnimalDto, cls: new () => T): Promise<T> {

		const existCode = await this.findOneByCode(data.code,{
			throwException: false,
			template: RanchAnimalPlainDto
		})
		if (existCode){
			throw new MyConflictException('El codigo del animal a crear ya se encuentra en uso')
		}
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

		if ((data.codeFather && data.codeMother) && (data.codeFather === data.codeMother)){
			throw new MyConflictException('El padre y la madre no pueden tenrer el mismo codigo.');
		}

		const ranchAnimal = new RanchAnimal();
		if (data.codeMother){
			ranchAnimal.idMother = (await this.findOneByCode(data.codeMother,{
				throwException: true,
				template: RanchAnimalPlainDto
			}))!.id;
		}
		if (data.codeFather){
			ranchAnimal.idFather = (await this.findOneByCode(data.codeFather,{
				throwException: true,
				template: RanchAnimalPlainDto
			}))!.id;
		}
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

	async findOneByCode<T>(code: string, optionsData: OptionsFindDto<T, RanchAnimal>): Promise<T | null> {
		const options = Object.assign(new OptionsFindDto(), optionsData)
		const templateClass = options.template ? options.template : (RanchAnimalDto as unknown as new () => T)
		let template = findWithAutoMapper(templateClass);
		const animal = await this.ranchAnimalRepository.findOne({
			where: {
				code: code,
				...(options.where ? options.where : {}),
			},
			select: template.select,
			relations: template.relations
		}) as T
		if (!animal && options.throwException === true) {
			throw new RanchAnimalNotFoundByCodeException(code);
		}
		if (!animal) {
			return null;
		}
		return plainToInstance(templateClass, animal, { excludeExtraneousValues: true });
	}

	/**
	 * Crea una cría (nuevo animal) dentro de una transacción activa.
	 * Usado por el caso de uso de parto cuando la cría nació viva.
	 * El llamador es responsable de las validaciones previas (raza, estado, código único).
	 */
	async createCria(data: {
		idRanch: number;
		idBreed: number;
		idStatus: number;
		code: string;
		sex: 'F' | 'M';
		birthdate: Date;
		weight?: number;
		idMother?: number;
	}, manager: EntityManager): Promise<RanchAnimal> {
		const repo = manager.getRepository(RanchAnimal);
		const cria = new RanchAnimal();
		cria.idRanch = data.idRanch;
		cria.idBreed = data.idBreed;
		cria.idStatus = data.idStatus;
		cria.code = data.code;
		cria.sex = data.sex;
		cria.birthdate = data.birthdate;
		if (data.weight) cria.weight = data.weight;
		if (data.idMother) cria.idMother = data.idMother;
		return await repo.save(cria);
	}

	/**
	 * Marca un animal como que ya ha parido (hasCalved = true).
	 * Si se pasa manager, opera dentro de la transacción activa.
	 */
	async markHasCalved(idRanchAnimal: number, manager: EntityManager): Promise<void> {
		const repo = manager.getRepository(RanchAnimal);
		await repo.update({ id: idRanchAnimal }, { hasCalved: true });
	}

	/**
	 * Marca una cría como destetada (isWeared = true).
	 * Si se pasa manager, opera dentro de la transacción activa.
	 */
	async markIsWeaned(idRanchAnimal: number, manager: EntityManager): Promise<void> {
		const repo = manager.getRepository(RanchAnimal);
		await repo.update({ id: idRanchAnimal }, { isWeared: true });
	}

	/**
	 * Revierte el marcado de destete de un animal (isWeared = null).
	 * Se usa al eliminar un registro de destete.
	 * Si se pasa manager, opera dentro de la transacción activa.
	 */
	async markIsNotWeaned(idRanchAnimal: number, manager: EntityManager): Promise<void> {
		const repo = manager.getRepository(RanchAnimal);
		await repo.update({ id: idRanchAnimal }, { isWeared: null as any });
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
				...(data.idMother ? {
					idMother: data.idMother
				}:{}),
				...(data.idFather ? {
					idMother: data.idFather
				}:{}),
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
