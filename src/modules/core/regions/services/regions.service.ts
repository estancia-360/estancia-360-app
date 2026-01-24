import { Injectable } from '@nestjs/common';
import { CreateRegionDto } from '../dto/create-region.dto';
import { UpdateRegionDto } from '../dto/update-region.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Region } from '../entities/region.entity';
import { Repository } from 'typeorm';
import { RegionDto } from '../dto/region.dto';
import { findWithAutoMapper } from 'src/infrastructure/database/utils';
import { OptionsFindDto } from 'src/shared/dto/options-find.dto';

@Injectable()
export class RegionsService {
	constructor(
		@InjectRepository(Region)
		private readonly regionRepository: Repository<Region>
	) { }

	async findAll<T>(optionsData: OptionsFindDto<T, Region>) {
		const options = Object.assign(new OptionsFindDto(), optionsData)
		const templateClass = options.template ? options.template : (RegionDto as unknown as new () => T)
		let template = findWithAutoMapper(templateClass);
		const countries = await this.regionRepository.find({
			select: template.select,
			relations: template.relations,
			where: options.where
		})
		return countries;
	}
}
