import {
	Controller,
	Param,
	ParseIntPipe,
	Body,
	Get,
	Patch,
	Query,
	Inject,
	forwardRef,
	Req,
	ForbiddenException,
	Post,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody  } from '@nestjs/swagger';
import { MatchesService } from 'src/modules/game/matches.service';
import { AchievementsService } from 'src/modules/game/achievement/achievements.service';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import type { AuthRequest } from '../auth/jwt-auth.guard';


type SortBy = 'xp' | 'wins' | 'totalGames';

@ApiTags('Users')
@Controller('users')
export class UsersController {
	constructor(
		private usersService: UsersService,
		@Inject(forwardRef(() => MatchesService))
		private readonly matchServices: MatchesService,
		private readonly achievementsService: AchievementsService,
	) {}

	@ApiOperation({ summary: 'Get all of achievements of users' })
	@Get(':id/achievements')
	getAchievements(@Param('id', ParseIntPipe) id: number) {
		return this.achievementsService.getAchievements(id);
	}

	@ApiOperation({ summary: 'Get leaderboard of users' })
	@Get('leaderboard')
	getLeaderboard(@Query('sortBy') sortBy?: SortBy) {
		const allowedSorts: SortBy[] = ['xp', 'wins', 'totalGames'];

		const safeSortBy: SortBy = sortBy && allowedSorts.includes(sortBy) ? sortBy : 'xp';
		return this.matchServices.getGameLeaderboard(safeSortBy);
	}

	@ApiOperation({ summary: 'Get all users' })
	@Get()
	getUsers(@Query() query: GetUsersQueryDto) {
		return this.usersService.getUsers(query);
	}

	@ApiOperation({ summary: 'Upload avatar for the current authenticated user' })
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				avatar: {
					type: 'string',
					format: 'binary',
				},
			},
			required: ['avatar'],
		},
	})
	@Post('me/avatar')
	@UseInterceptors(FileInterceptor('avatar'))
	uploadMyAvatar(
		@UploadedFile() file: Express.Multer.File,
		@Req() req: AuthRequest,
	) {
		return this.usersService.updateAvatar(req.user.sub, file);
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
		@Req() req,
	) {
		if (req.user.sub !== id) {
			throw new ForbiddenException('You can only update your own profile');
		}
		return this.usersService.updateUser(id, updateUserDto);
	}

  @ApiOperation({ summary: 'Get history by ID' })
  @Get(':id/history')
  getHistory(@Param('id', ParseIntPipe) id: number) {
    return this.matchServices.getFinishedGamesHistory(id);
  }
}
