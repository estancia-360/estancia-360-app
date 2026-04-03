import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { AnimalClass } from '../entities/animal-class.entity';
import { AnimalClassDto } from '../dto/animal-class.dto';
import { AnimalClassNotFoundException } from '../exceptions';
import { OptionsFindDto } from 'src/shared/dto/options-find.dto';
import { findWithAutoMapper } from 'src/infrastructure/database/utils';

@Injectable()
export class AnimalClassesService {
    constructor(
        @InjectRepository(AnimalClass)
        private readonly animalClassRepository: Repository<AnimalClass>,
    ) {}

    async findAll(): Promise<AnimalClassDto[]> {
        const classes = await this.animalClassRepository.find({
            where: { isActive: true },
            order: { id: 'ASC' },
        });
        return plainToInstance(AnimalClassDto, classes, { excludeExtraneousValues: true });
    }

    async findOneById<T>(id: number, optionsData: OptionsFindDto<T, AnimalClass>): Promise<T | null> {
        const options = Object.assign(new OptionsFindDto(), optionsData);
        const templateClass = options.template ? options.template : (AnimalClassDto as unknown as new () => T);
        let template = findWithAutoMapper(templateClass);
        const animalClass = await this.animalClassRepository.findOne({
            where: { id, ...(options.where ? options.where : {}) },
            select: template.select,
        }) as T;
        if (!animalClass && options.throwException === true) {
            throw new AnimalClassNotFoundException(id);
        }
        if (!animalClass) return null;
        return plainToInstance(templateClass, animalClass, { excludeExtraneousValues: true });
    }
}
