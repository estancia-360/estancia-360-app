import { Injectable } from '@nestjs/common';
import { CreateCityDto } from '../dto/create-city.dto';
import { UpdateCityDto } from '../dto/update-city.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { City } from '../entities/city.entity';
import { Repository } from 'typeorm';
import { OptionsFindDto } from 'src/shared/dto/options-find.dto';
import { CityDto } from '../dto/city.dto';
import { findWithAutoMapper } from 'src/infrastructure/database/utils';
import { MyNotFoundException } from 'src/shared/exceptions';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CitiesService {
	constructor(
		@InjectRepository(City)
		private readonly cityRepository: Repository<City>
	) { }

	async findOneById<T>(idCity: number, optionsData: OptionsFindDto<T, City>) {
		const options = Object.assign(new OptionsFindDto(), optionsData)
		const templateClass = options.template ? options.template : (CityDto as unknown as new () => T)
		let template = findWithAutoMapper(templateClass);
		const ranch = await this.cityRepository.findOne({
			where: {
				id: idCity,
				...(options.where ? options.where : {}),
			},
			select: template.select,
			relations: template.relations
		}) as T
		if (!ranch && options.throwException === true) {
			throw new MyNotFoundException(`No se encontro la ciudad ingresada.`)
		}
		if (!ranch) {
			return null;
		}
		return plainToInstance(templateClass, ranch, { excludeExtraneousValues: true });
	}

	async findAll<T>(optionsData: OptionsFindDto<T, City>) {
		const options = Object.assign(new OptionsFindDto(), optionsData)
		const templateClass = options.template ? options.template : (CityDto as unknown as new () => T)
		let template = findWithAutoMapper(templateClass);
		const countries = await this.cityRepository.find({
			select: template.select,
			relations: template.relations,
			where: options.where
		})
		return countries;
	}
}
