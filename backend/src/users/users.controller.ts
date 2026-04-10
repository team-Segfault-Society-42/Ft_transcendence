import { Controller, Param, ParseIntPipe, Body, Get, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto} from './dto/update-user.dto';
// import { CreateUserDto } from './dto/create-user.dto';

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
		return this.usersService.getUser(id);
	}

	@Patch(':id')
	updateUser(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateUserDto: UpdateUserDto,
	) {
		return this.usersService.updateUser(id, updateUserDto);
	}

}


