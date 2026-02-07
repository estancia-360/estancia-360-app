import { Module } from '@nestjs/common';
import { AnimalBreedsService } from './services/animal-breeds.service';
import { AnimalBreedsController } from './controllers/animal-breeds.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnimalBreed } from './entities/animal-breed.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([AnimalBreed])
	],
	controllers: [AnimalBreedsController],
	providers: [AnimalBreedsService],
	exports: [AnimalBreedsService],
})
export class AnimalBreedsModule { }
