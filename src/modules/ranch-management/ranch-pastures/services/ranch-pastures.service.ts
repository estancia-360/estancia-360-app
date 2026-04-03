import { Injectable } from '@nestjs/common';
import { CreateRanchPastureDto } from '../dto/create-ranch-pasture.dto';
import { UpdateRanchPastureDto } from '../dto/update-ranch-pasture.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RanchPasture } from '../entities/ranch-pasture.entity';
import { Repository } from 'typeorm';
import { MyNotFoundException } from 'src/shared/exceptions';
import { RanchesService } from '../../ranches/services/ranches.service';

@Injectable()
export class RanchPasturesService {
	constructor(
		@InjectRepository(RanchPasture)
		private readonly ranchPasturesRepository: Repository<RanchPasture>,
		private readonly ranchesService: RanchesService,
	){}

	async create(createRanchPastureDto: CreateRanchPastureDto) {
		// Validar que la estancia existe
		await this.ranchesService.findOneById(createRanchPastureDto.idRanch, { throwException: true });

		const pasture = new RanchPasture();
		pasture.idRanch = createRanchPastureDto.idRanch;
		pasture.name = createRanchPastureDto.name;
		pasture.areaHectares = createRanchPastureDto.areaHectares;
		if (createRanchPastureDto.description) {
			pasture.description = createRanchPastureDto.description;
		}
		pasture.isActive = createRanchPastureDto.isActive ?? true;
		pasture.createdAt = new Date();
		pasture.updatedAt = new Date();

		return await this.ranchPasturesRepository.save(pasture);
	}

	/**
	 * Obtiene todos los potreros de una estancia específica
	 * @param idRanch - ID de la estancia
	 * @returns Array de potreros con tipado correcto (bigint→number)
	 */
	async findAllByRanch(idRanch: number) {
		const pastures = await this.ranchPasturesRepository.find({
			where: { idRanch },
			relations: ['ranch'],
			order: { id: 'DESC' },
		});
		// Convertir bigint a number en response
		return pastures.map(p => ({
			id: Number(p.id),
			idRanch: Number(p.idRanch),
			name: p.name,
			areaHectares: p.areaHectares,
			description: p.description,
			isActive: p.isActive,
			createdAt: p.createdAt,
			updatedAt: p.updatedAt,
		}));
	}

	/**
	 * Obtiene todos los potreros (deprecated - usar findAllByRanch)
	 * @deprecated Usar findAllByRanch(idRanch) en su lugar
	 */
	async findAll() {
		return await this.ranchPasturesRepository.find({
			relations: ['ranch'],
			order: { id: 'DESC' },
		});
	}

	async findOneById(id: number, options?: { throwException?: boolean }) {
		const pasture = await this.ranchPasturesRepository.findOne({
			where: { id },
			relations: ['ranch'],
		});
		if (!pasture && options?.throwException) {
			throw new MyNotFoundException(`Potrero con ID ${id} no encontrado`);
		}
		return pasture;
	}

	async findOne(id: number) {
		return this.findOneById(id, { throwException: true });
	}

	async update(id: number, updateRanchPastureDto: UpdateRanchPastureDto) {
		const pasture = await this.ranchPasturesRepository.findOne({ where: { id } });
		if (!pasture) {
			throw new MyNotFoundException(`Potrero con ID ${id} no encontrado`);
		}

		if (updateRanchPastureDto.name) pasture.name = updateRanchPastureDto.name;
		if (updateRanchPastureDto.areaHectares !== undefined) pasture.areaHectares = updateRanchPastureDto.areaHectares;
		if (updateRanchPastureDto.description !== undefined) pasture.description = updateRanchPastureDto.description;
		if (updateRanchPastureDto.isActive !== undefined) pasture.isActive = updateRanchPastureDto.isActive;

		const updated = await this.ranchPasturesRepository.save(pasture);
		return this.findOne(updated.id);
	}

	async remove(id: number) {
		const pasture = await this.ranchPasturesRepository.findOne({ where: { id } });
		if (!pasture) {
			throw new MyNotFoundException(`Potrero con ID ${id} no encontrado`);
		}
		await this.ranchPasturesRepository.remove(pasture);
		return { message: `Potrero ${id} eliminado exitosamente` };
	}
}
