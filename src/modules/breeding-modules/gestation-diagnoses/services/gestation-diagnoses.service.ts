import { Injectable } from '@nestjs/common';
import { CreateGestationDiagnosisDto } from '../dto/create-gestation-diagnosis.dto';
import { UpdateGestationDiagnosisDto } from '../dto/update-gestation-diagnosis.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { GestationDiagnosis } from '../entities/gestation-diagnosis.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GestationDiagnosesService {
	constructor(
		@InjectRepository(GestationDiagnosis)
		private readonly gestationDiagnosisRepository: Repository<GestationDiagnosis>
	){}

	create(createGestationDiagnosisDto: CreateGestationDiagnosisDto) {
		return 'This action adds a new gestationDiagnosis';
	}

	findAll() {
		return `This action returns all gestationDiagnoses`;
	}

	findOne(id: number) {
		return `This action returns a #${id} gestationDiagnosis`;
	}

	update(id: number, updateGestationDiagnosisDto: UpdateGestationDiagnosisDto) {
		return `This action updates a #${id} gestationDiagnosis`;
	}

	remove(id: number) {
		return `This action removes a #${id} gestationDiagnosis`;
	}
}
