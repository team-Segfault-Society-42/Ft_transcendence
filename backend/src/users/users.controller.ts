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
	UseFilters,
	UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiResponse, ApiParam, ApiQuery  } from '@nestjs/swagger';
import { MatchesService } from 'src/modules/game/matches.service';
import { AchievementsService } from 'src/modules/game/achievement/achievements.service';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import type { AuthRequest } from '../auth/jwt-auth.guard';
import { AVATAR_MAX_FILE_SIZE } from './avatar.constants';
import { AvatarUploadExceptionFilter } from './avatar-upload.exception-filter';
import { AvatarUploadRateLimitGuard } from './avatar-upload-rate-limit.guard';
import { AchievementDto } from './dto/achievements.dto';


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

	@ApiOperation({ summary: 'Get the user ranking' })
	@ApiParam({ name: 'id', description: 'User ID', example:1 })
	@ApiResponse({ status: 200, description: 'Return user ranking' })
	@Get(':id/rank')
	getUserRank(@Param('id', ParseIntPipe) id: number): Promise<{ rank: number, xp: number }> {
		return this.usersService.getUserRank(id)
	}

	@ApiOperation({ summary: 'Get all existing achievements' })
	@ApiResponse({ status: 200, type: [AchievementDto] })
	@Get('allAchievements')
	getAllAchievements() {
		return this.achievementsService.getAllAchievements()
	}

	@ApiOperation({ summary: 'Get all of achievements of users' })
	@ApiParam({ name: 'id', description: 'User ID', example: 1 })
	@ApiResponse({ status: 200, description: 'Return user achievements list' })
	@Get(':id/achievements')
	getAchievements(@Param('id', ParseIntPipe) id: number) {
		return this.achievementsService.getAchievements(id);
	}

	@ApiOperation({ summary: 'Get user by username', description: 'Retrieves a users public profile from their exact username.' })
	@ApiParam({
		name: 'username',
		description: 'The unique username of the user being searched for',
		example: 'dummy5'
	})
	@ApiResponse({
		status: 200,
		description: 'User successfully found.'
	})
	@ApiResponse({ 
        status: 404, 
        description: 'No users were found with this username.' 
    })
	@Get('by-username/:username')
	getUserByUsername(@Param('username') username: string) {
		return this.usersService.getUserByUsername(username)
	}



	@ApiOperation({ summary: 'Get leaderboard of users' })
	@ApiQuery({
		name: 'sortBy',
		enum: ['xp', 'wins', 'totalGames'],
		required: false,
		description: 'Criteria to sort the leaderboard'
	})
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
	@UseGuards(AvatarUploadRateLimitGuard)
	@UseFilters(AvatarUploadExceptionFilter)
	@UseInterceptors(
		FileInterceptor('avatar', {
			limits: {
				fileSize: AVATAR_MAX_FILE_SIZE,
			},
		}),
	)
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
			throw new ForbiddenException('ERR_USER_UPDATE_FORBIDDEN');
		}
		return this.usersService.updateUser(id, updateUserDto);
	}

  @ApiOperation({ summary: 'Get history by ID' })
  @Get(':id/history')
  getHistory(@Param('id', ParseIntPipe) id: number) {
    return this.matchServices.getFinishedGamesHistory(id);
  }
}
