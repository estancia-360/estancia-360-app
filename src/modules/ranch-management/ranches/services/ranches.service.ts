import { Injectable } from '@nestjs/common';
import { CreateRanchDto } from '../dto/create-ranch.dto';
import { UpdateRanchDto } from '../dto/update-ranch.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Ranch } from '../entities/ranch.entity';
import { Repository } from 'typeorm';
import { CitiesService } from 'src/modules/core/cities/services/cities.service';
import { ProductionTypesService } from 'src/modules/core/production-types/services/production-types.service';
import { CityDto } from 'src/modules/core/cities/dto/city.dto';
import { ProductionTypeDto } from 'src/modules/core/production-types/dto/production-type.dto';
import { OptionsFindDto } from 'src/shared/dto/options-find.dto';
import { RanchDto } from '../dto/ranch.dto';
import { findWithAutoMapper } from 'src/infrastructure/database/utils';
import { MyNotFoundException } from 'src/shared/exceptions';
import { plainToInstance } from 'class-transformer';
import { UsersService } from 'src/modules/user-management/users/services/users.service';
import { RanchUsersService } from '../../ranch-users/services/ranch-users.service';
import { UserDto } from 'src/modules/user-management/users/dto/user.dto';
import { RanchRolesEnum } from 'src/shared/enums';
import { RanchProductionType } from '../../ranch-production-types/entities/ranch-production-type.entity';
import { RanchSubscriptionsService } from 'src/modules/payment-modules/ranch-subscriptions/services/ranch-subscriptions.service';

@Injectable()
export class RanchesService {
	constructor(
		@InjectRepository(Ranch)
		private readonly ranchRepository: Repository<Ranch>,
		@InjectRepository(RanchProductionType)
		private readonly ranchProductionTypeRepository: Repository<RanchProductionType>,
		private readonly citiesService: CitiesService,
		private readonly productionTypesService: ProductionTypesService,
		private readonly usersService: UsersService,
		private readonly ranchUsersService: RanchUsersService,
		private readonly ranchSubscriptionsService: RanchSubscriptionsService,
	) { }

	async create<T>(data: CreateRanchDto, cls: new () => T) {
		const user = await this.usersService.findOneById(data.idUser, {
			throwException: true,
			where: {
				isDeleted: false
			},
			template: UserDto,
		});
		const city = await this.citiesService.findOneById(data.idCity, {
			throwException: true,
			where: {
				isActive: true
			},
			template: CityDto
		});
		await Promise.all(data.idProductionTypes.map(idPt =>
			this.productionTypesService.findOneById(idPt, {
				throwException: true,
				where: { isActive: true },
				template: ProductionTypeDto
			})
		));
		const ranch = new Ranch();
		ranch.idCity = city!.id;
		ranch.name = data.name.trim();
		const ranchSaved = await this.ranchRepository.save(ranch);
		await this.ranchProductionTypeRepository.save(
			data.idProductionTypes.map(idPt => {
				const rpt = new RanchProductionType();
				rpt.idRanch = ranchSaved.id;
				rpt.idProductionType = idPt;
				return rpt;
			})
		);
		await this.ranchUsersService.create({
			idUser: data.idUser,
			idRanch: ranchSaved.id,
			idRanchRole: RanchRolesEnum.OWNER
		});
		await this.ranchSubscriptionsService.createFreeSubscription(ranchSaved.id);
		return await this.findOneById<T>(ranchSaved.id, {
			template: cls
		});
	}

	async findOneById<T>(idProductionType: number, optionsData: OptionsFindDto<T, Ranch>) {
		const options = Object.assign(new OptionsFindDto(), optionsData)
		const templateClass = options.template ? options.template : (RanchDto as unknown as new () => T)
		let template = findWithAutoMapper(templateClass);
		const ranch = await this.ranchRepository.findOne({
			where: {
				id: idProductionType,
				...(options.where ? options.where : {}),
			},
			select: template.select,
			relations: template.relations
		}) as T
		if (!ranch && options.throwException === true) {
			throw new MyNotFoundException(`No se encontro la estancia buscada.`)
		}
		if (!ranch) {
			return null;
		}
		return plainToInstance(templateClass, ranch, { excludeExtraneousValues: true });
	}
}
