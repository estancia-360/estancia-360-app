import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Res } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import express from 'express';
import { UserDto } from '../dto/user.dto';
import { OkRes } from 'src/shared/utils';

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) { }

	@Get(':idUser')
	async findOneById(
		@Param('idUser',ParseIntPipe) idUser: number,
		@Res() res: express.Response,
	){
		const user = await this.usersService.findOneById(idUser,{
			throwException: true,
			template: UserDto,
			where: {
				isDeleted: false,
			}
		})
		return OkRes(res,{
			user: user
		})
	}
}
