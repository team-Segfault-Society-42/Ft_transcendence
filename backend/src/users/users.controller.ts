import { Controller, Param, ParseIntPipe, Body, Get, Patch, UseGuards, Query , Inject, forwardRef} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto} from './dto/update-user.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MatchesService } from 'src/modules/game/matches.service';
import { AchievementsService } from 'src/modules/game/achievements.service';

@ApiTags('Users')

@Controller('users')
export class UsersController {

	constructor(private usersService: UsersService, 
		@Inject(forwardRef(() => MatchesService)) private readonly matchServices: MatchesService,
		private readonly achievementsService: AchievementsService) {}


	@ApiOperation({ summary: 'Get all of achievements of users' })
	@Get(':id/achievements')
	getAchievements(@Param('id', ParseIntPipe) id: number) {
		return this.achievementsService.getAchievements(id)
	}

	@ApiOperation({ summary: 'Get leaderboard of users' })
	@Get('leaderboard')
	getLeaderboard( @Query('sortBy') sortBy: string) {
		const safeSortBy = sortBy === "xp" ? "xp" : "wins"
		return this.matchServices.getGameLeaderboard(safeSortBy)
	}
	
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

}


