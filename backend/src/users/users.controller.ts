import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';

// @UseGuards(AuthGuard) // TODO later with AUTH
@Controller('users')
export class UsersController {

	constructor(private usersService: UsersService) {}

	@Get()
	getUsers() {
		return this.usersService.getUsers();
	}

	@Get(':id')
	getUser(@Param('id', ParseIntPipe) id: number) {
		return this.usersService.getUser(Number(id));
	}
}


