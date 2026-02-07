import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AnimalStatusesService } from '../services/animal-statuses.service';
import { CreateAnimalStatusDto } from '../dto/create-animal-status.dto';
import { UpdateAnimalStatusDto } from '../dto/update-animal-status.dto';

@Controller('animal-statuses')
export class AnimalStatusesController {
	constructor(private readonly animalStatusesService: AnimalStatusesService) { }
}
