import { Controller, Param, ParseIntPipe, Body, Get, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto} from './dto/update-user.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { MatchesService } from 'src/modules/game/matches.service';

@ApiTags('Users')

@Controller('users')
export class UsersController {

	constructor(private usersService: UsersService, private readonly matchServices: MatchesService) {}

	@ApiOperation({ summary: 'Get all users' })
	@Get()
	getUsers() {
		return this.usersService.getUsers();
	}

	@ApiOperation({ summary: 'Get user by ID' })
	@Get(':id')
	getUser(@Param('id', ParseIntPipe) id: number) {
		return this.usersService.getUser(id);
	}

	@ApiOperation({ summary: 'Update user' })
	@Patch(':id')
	updateUser(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateUserDto: UpdateUserDto,
	) {
		return this.usersService.updateUser(id, updateUserDto);
	}

	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Get history by ID' })
	@Get(':id/history')
	getHistory(@Param('id', ParseIntPipe) id: number) {
		return this.matchServices.getFinishedGamesHistory(id)
	}

}


