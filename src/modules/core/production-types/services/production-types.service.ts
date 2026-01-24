import { Injectable } from '@nestjs/common';
import { CreateProductionTypeDto } from '../dto/create-production-type.dto';
import { UpdateProductionTypeDto } from '../dto/update-production-type.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductionType } from '../entities/production-type.entity';
import { Repository } from 'typeorm';
import { OptionsFindDto } from 'src/shared/dto/options-find.dto';
import { findWithAutoMapper } from 'src/infrastructure/database/utils';
import { MyNotFoundException } from 'src/shared/exceptions';
import { plainToInstance } from 'class-transformer';
import { ProductionTypeDto } from '../dto/production-type.dto';

@Injectable()
export class ProductionTypesService {
	constructor(
		@InjectRepository(ProductionType)
		private readonly productionTypeRepository: Repository<ProductionType>
	) { }

	async findOneById<T>(idProductionType: number, optionsData: OptionsFindDto<T, ProductionType>) {
		const options = Object.assign(new OptionsFindDto(), optionsData)
		const templateClass = options.template ? options.template : (ProductionTypeDto as unknown as new () => T)
		let template = findWithAutoMapper(templateClass);
		const productionType = await this.productionTypeRepository.findOne({
			where: {
				id: idProductionType,
				...(options.where ? options.where : {}),
			},
			select: template.select,
			relations: template.relations
		}) as T
		if (!productionType && options.throwException === true) {
			throw new MyNotFoundException(`No se encontro el tipo de produccion ingresado.`)
		}
		if (!productionType) {
			return null;
		}
		return plainToInstance(templateClass, productionType, { excludeExtraneousValues: true });
	}
}
