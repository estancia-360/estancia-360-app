import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AnimalBreedsService } from '../services/animal-breeds.service';
import { CreateAnimalBreedDto } from '../dto/create-animal-breed.dto';
import { UpdateAnimalBreedDto } from '../dto/update-animal-breed.dto';

@Controller('animal-breeds')
export class AnimalBreedsController {
  constructor(private readonly animalBreedsService: AnimalBreedsService) {}
}
