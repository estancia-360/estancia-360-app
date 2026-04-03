import { Injectable } from '@nestjs/common';
import { CreateRanchLotDto } from '../dto/create-ranch-lot.dto';
import { UpdateRanchLotDto } from '../dto/update-ranch-lot.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RanchLot } from '../entities/ranch-lot.entity';
import { Repository } from 'typeorm';
import { MyNotFoundException } from 'src/shared/exceptions';
import { RanchesService } from '../../ranches/services/ranches.service';
import { RanchPasturesService } from '../../ranch-pastures/services/ranch-pastures.service';

@Injectable()
export class RanchLotsService {
	constructor(
		@InjectRepository(RanchLot)
		private readonly ranchLotsRepository: Repository<RanchLot>,
		private readonly ranchesService: RanchesService,
		private readonly ranchPasturesService: RanchPasturesService,
	){}

	async create(createRanchLotDto: CreateRanchLotDto) {
		// Validar que la estancia existe
		await this.ranchesService.findOneById(createRanchLotDto.idRanch, { throwException: true });

		// Validar que el potrero existe
		await this.ranchPasturesService.findOne(createRanchLotDto.idRanchPasture);

		const lot = new RanchLot();
		lot.idRanch = createRanchLotDto.idRanch;
		lot.idRanchPasture = createRanchLotDto.idRanchPasture;
		lot.name = createRanchLotDto.name;
		lot.lotType = createRanchLotDto.lotType;
		lot.capacity = createRanchLotDto.capacity || null;
		lot.isActive = true;
		lot.createdAt = new Date();
		lot.updatedAt = new Date();

		return await this.ranchLotsRepository.save(lot);
	}

	/**
	 * Obtiene todos los lotes de una estancia específica
	 * @param idRanch - ID de la estancia
	 * @returns Array de lotes con tipado correcto (bigint→number)
	 */
	async findAllByRanch(idRanch: number) {
		const lots = await this.ranchLotsRepository.find({
			where: { idRanch },
			relations: ['ranch', 'pasture'],
			order: { id: 'DESC' },
		});
		// Convertir bigint a number en response
		return lots.map(l => ({
			id: Number(l.id),
			idRanch: Number(l.idRanch),
			idRanchPasture: Number(l.idRanchPasture),
			name: l.name,
			lotType: l.lotType,
			capacity: l.capacity,
			isActive: l.isActive,
			createdAt: l.createdAt,
			updatedAt: l.updatedAt,
		}));
	}

	/**
	 * Obtiene todos los lotes (deprecated - usar findAllByRanch)
	 * @deprecated Usar findAllByRanch(idRanch) en su lugar
	 */
	async findAll() {
		return await this.ranchLotsRepository.find({
			relations: ['ranch', 'pasture'],
			order: { id: 'DESC' },
		});
	}

	async findOne(id: number) {
		const lot = await this.ranchLotsRepository.findOne({
			where: { id },
			relations: ['ranch', 'pasture'],
		});
		if (!lot) {
			throw new MyNotFoundException(`Lote con ID ${id} no encontrado`);
		}
		return lot;
	}

	async update(id: number, updateRanchLotDto: UpdateRanchLotDto) {
		const lot = await this.ranchLotsRepository.findOne({ where: { id } });
		if (!lot) {
			throw new MyNotFoundException(`Lote con ID ${id} no encontrado`);
		}

		if (updateRanchLotDto.name) lot.name = updateRanchLotDto.name;
		if (updateRanchLotDto.lotType) lot.lotType = updateRanchLotDto.lotType;
		if (updateRanchLotDto.capacity !== undefined) lot.capacity = updateRanchLotDto.capacity;

		const updated = await this.ranchLotsRepository.save(lot);
		return this.findOne(updated.id);
	}

	async remove(id: number) {
		const lot = await this.ranchLotsRepository.findOne({ where: { id } });
		if (!lot) {
			throw new MyNotFoundException(`Lote con ID ${id} no encontrado`);
		}
		await this.ranchLotsRepository.remove(lot);
		return { message: `Lote ${id} eliminado exitosamente` };
	}
}
