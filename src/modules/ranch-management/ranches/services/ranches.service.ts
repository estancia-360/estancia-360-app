import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Ranch } from '../entities/ranch.entity';
import { RanchProductionType } from 'src/modules/ranch-management/ranch-production-types/entities/ranch-production-type.entity';
import { CreateRanchDto } from '../dto/create-ranch.dto';
import { RanchNotFoundException } from '../exceptions';
import { DtoRepository } from 'src/shared/orm';
import { FindOptions } from 'src/shared/dto';
import { CitiesService } from 'src/modules/core/cities/services/cities.service';
import { CityDto } from 'src/modules/core/cities/dto/city.dto';
import { ProductionTypesService } from 'src/modules/core/production-types/services/production-types.service';
import { ProductionTypeDto } from 'src/modules/core/production-types/dto/production-type.dto';
import { UsersService } from 'src/modules/user-management/users/services/users.service';
import { UserDto } from 'src/modules/user-management/users/dto/user.dto';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';
import { RanchSubscriptionsService } from 'src/modules/payment-modules/ranch-subscriptions/services/ranch-subscriptions.service';
import { RanchRolesEnum } from 'src/shared/enums';

@Injectable()
export class RanchesService {
    private readonly repo: DtoRepository<Ranch>;

    constructor(
        @InjectRepository(Ranch)
        private readonly rawRepo: Repository<Ranch>,
        @InjectDataSource()
        private readonly dataSource: DataSource,
        private readonly citiesService: CitiesService,
        private readonly productionTypesService: ProductionTypesService,
        private readonly usersService: UsersService,
        private readonly ranchUsersService: RanchUsersService,
        private readonly ranchSubscriptionsService: RanchSubscriptionsService,
    ) {
        this.repo = new DtoRepository(rawRepo);
    }

    findOneById<T>(dto: new () => T, id: number, options: { throwException: false }): Promise<T | null>;
    findOneById<T>(dto: new () => T, id: number, options?: FindOptions): Promise<T>;
    async findOneById<T>(dto: new () => T, id: number, { throwException = true }: FindOptions = {}): Promise<T | null> {
        const result = await this.repo.findOne({ dto, where: { id } });
        if (!result && throwException) throw new RanchNotFoundException();
        return result;
    }

    /**
     * Crea la estancia y, en la MISMA transacción: sus tipos de producción,
     * el Owner (quien la crea) y la suscripción Free automática.
     *
     * El proyecto viejo hacía estos 4 pasos sueltos, sin transacción — si el
     * último fallaba (ej. no había plan Free configurado), quedaba una
     * estancia guardada sin dueño y sin suscripción. Acá, si cualquier paso
     * falla, no queda nada a medio crear.
     */
    async create<T>(dto: CreateRanchDto, returnDto: new () => T): Promise<T> {
        // Validaciones de existencia — fuera de la transacción, son solo lecturas.
        await this.usersService.findOneById(UserDto, dto.idUser);
        const city = await this.citiesService.findOneById(CityDto, dto.idCity);
        await Promise.all(
            dto.idProductionTypes.map((idProductionType) =>
                this.productionTypesService.findOneById(ProductionTypeDto, idProductionType),
            ),
        );

        const ranchId = await this.dataSource.transaction(async (manager) => {
            const ranchRepo = manager.getRepository(Ranch);
            const ranch = ranchRepo.create();
            ranch.idCity = city.id;
            ranch.name = dto.name.trim();
            const savedRanch = await ranchRepo.save(ranch);

            const rptRepo = manager.getRepository(RanchProductionType);
            await rptRepo.save(
                dto.idProductionTypes.map((idProductionType) => {
                    const rpt = rptRepo.create();
                    rpt.idRanch = savedRanch.id;
                    rpt.idProductionType = idProductionType;
                    return rpt;
                }),
            );

            await this.ranchUsersService.create(
                { idUser: dto.idUser, idRanch: savedRanch.id, idRanchRole: RanchRolesEnum.OWNER },
                manager,
            );

            await this.ranchSubscriptionsService.createFreeSubscription(savedRanch.id, manager);

            return savedRanch.id;
        });

        return (await this.findOneById(returnDto, ranchId))!;
    }
}
