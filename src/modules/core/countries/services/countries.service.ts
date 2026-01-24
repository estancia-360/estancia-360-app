import { Injectable } from '@nestjs/common';
import { CreateCountryDto } from '../dto/create-country.dto';
import { UpdateCountryDto } from '../dto/update-country.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Country } from '../entities/country.entity';
import { Repository } from 'typeorm';
import { OptionsFindDto } from 'src/shared/dto/options-find.dto';
import { findWithAutoMapper } from 'src/infrastructure/database/utils';
import { CountryDto } from '../dto/country.dto';

@Injectable()
export class CountriesService {
	constructor(
		@InjectRepository(Country)
		private readonly countryRepository: Repository<Country>
	) { }

	async findAll<T>(optionsData: OptionsFindDto<T, Country>) {
		const options = Object.assign(new OptionsFindDto(), optionsData)
		const templateClass = options.template ? options.template : (CountryDto as unknown as new () => T)
		let template = findWithAutoMapper(templateClass);
		const countries = await this.countryRepository.find({
			select: template.select,
			relations: template.relations,
			where: options.where
		})
		return countries;
	}
}
