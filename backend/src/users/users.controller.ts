import {
	Body,
	Controller,
	Delete,
	ForbiddenException,
	forwardRef,
	Get,
	Inject,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Query,
	Req,
	UploadedFile,
	UseFilters,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
	ApiBadRequestResponse,
	ApiBody,
	ApiConflictResponse,
	ApiConsumes,
	ApiCookieAuth,
	ApiForbiddenResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiQuery,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import type { AuthRequest } from '../auth/jwt-auth.guard';
import { AchievementsService } from '../modules/game/achievement/achievements.service';
import { MatchesService } from '../modules/game/matches.service';
import { AVATAR_MAX_FILE_SIZE } from './avatar.constants';
import { AvatarUploadExceptionFilter } from './avatar-upload.exception-filter';
import { AvatarUploadRateLimitGuard } from './avatar-upload-rate-limit.guard';
import { AchievementDto } from './dto/achievements.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

type SortBy = 'xp' | 'wins' | 'totalGames';

@ApiTags('Users')
@ApiCookieAuth()
@Controller('users')
export class UsersController {
	constructor(
		private readonly usersService: UsersService,

		@Inject(forwardRef(() => MatchesService))
		private readonly matchServices: MatchesService,

		private readonly achievementsService: AchievementsService,
	) {}

	/**
	 * @description Returns all achievements available in the application.
	 * @returns List of achievement definitions.
	 */
	@Get('allAchievements')
	@ApiOperation({ summary: 'Get all existing achievements' })
	@ApiOkResponse({
		description: 'All achievements returned successfully',
		type: [AchievementDto],
	})
	getAllAchievements() {
		return this.achievementsService.getAllAchievements();
	}

	/**
	 * @description Returns the game leaderboard sorted by a safe allowlisted field.
	 * @param sortBy - Optional leaderboard sorting criterion.
	 * @returns Leaderboard entries sorted by XP, wins, or total games.
	 * @remarks Invalid sort values fall back to XP instead of being passed to the service.
	 */
	@Get('leaderboard')
	@ApiOperation({ summary: 'Get leaderboard of users' })
	@ApiQuery({
		name: 'sortBy',
		enum: ['xp', 'wins', 'totalGames'],
		required: false,
		description: 'Criteria to sort the leaderboard.',
	})
	@ApiOkResponse({ description: 'Leaderboard returned successfully' })
	getLeaderboard(@Query('sortBy') sortBy?: SortBy) {
		const allowedSorts: SortBy[] = ['xp', 'wins', 'totalGames'];
		const safeSortBy: SortBy =
			sortBy && allowedSorts.includes(sortBy) ? sortBy : 'xp';

		return this.matchServices.getGameLeaderboard(safeSortBy);
	}

	/**
	 * @description Returns public users with pagination and optional username search.
	 * @param query - Validated pagination and search query parameters.
	 * @returns List of safe public user profiles.
	 */
	@Get()
	@ApiOperation({ summary: 'Get all users' })
	@ApiQuery({
		name: 'limit',
		required: false,
		description: 'Maximum number of users to return. Defaults to 20 and is capped to 100.',
	})
	@ApiQuery({
		name: 'offset',
		required: false,
		description: 'Number of users to skip before returning results. Defaults to 0.',
	})
	@ApiQuery({
		name: 'search',
		required: false,
		description: 'Optional case-insensitive username search.',
	})
	@ApiOkResponse({ description: 'Users returned successfully' })
	@ApiBadRequestResponse({ description: 'Invalid query parameters' })
	getUsers(@Query() query: GetUsersQueryDto) {
		return this.usersService.getUsers(query);
	}

	/**
	 * @description Uploads and stores an avatar for the authenticated user.
	 * @param file - Uploaded avatar file from multipart/form-data.
	 * @param req - Authenticated request containing the current user ID.
	 * @returns Updated safe public user profile.
	 * @remarks The service validates file signature, size, and allowed image type.
	 */
	@Post('me/avatar')
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
	@ApiOkResponse({ description: 'Avatar uploaded successfully' })
	@ApiBadRequestResponse({ description: 'Missing, invalid, or unsupported avatar file' })
	@ApiResponse({
		status: 413,
		description: 'Avatar file is too large',
	})
	@ApiResponse({
		status: 429,
		description: 'Avatar upload rate limit exceeded',
	})
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

	/**
	 * @description Returns a public user profile from an exact username.
	 * @param username - Exact username to search.
	 * @returns Safe public user profile.
	 */
	@Get('by-username/:username')
	@ApiOperation({
		summary: 'Get user by username',
		description: 'Retrieves a user public profile from their exact username.',
	})
	@ApiParam({
		name: 'username',
		description: 'Unique username of the user being searched for.',
		example: 'dummy5',
	})
	@ApiOkResponse({ description: 'User found successfully' })
	@ApiNotFoundResponse({ description: 'No user was found with this username' })
	getUserByUsername(@Param('username') username: string) {
		return this.usersService.getUserByUsername(username);
	}

	/**
	 * @description Returns the global XP rank for a user.
	 * @param id - User ID.
	 * @returns User rank and current XP.
	 */
	@Get(':id/rank')
	@ApiOperation({ summary: 'Get user ranking' })
	@ApiParam({ name: 'id', description: 'User ID.', example: 1 })
	@ApiOkResponse({ description: 'User ranking returned successfully' })
	@ApiNotFoundResponse({ description: 'User not found' })
	getUserRank(
		@Param('id', ParseIntPipe) id: number,
	): Promise<{ rank: number; xp: number }> {
		return this.usersService.getUserRank(id);
	}

	/**
	 * @description Returns achievements unlocked by a user.
	 * @param id - User ID.
	 * @returns User achievements list.
	 */
	@Get(':id/achievements')
	@ApiOperation({ summary: 'Get user achievements' })
	@ApiParam({ name: 'id', description: 'User ID.', example: 1 })
	@ApiOkResponse({ description: 'User achievements returned successfully' })
	getAchievements(@Param('id', ParseIntPipe) id: number) {
		return this.achievementsService.getAchievements(id);
	}

	/**
	 * @description Returns finished game history for a user.
	 * @param id - User ID.
	 * @returns Finished games history.
	 */
	@Get(':id/history')
	@ApiOperation({ summary: 'Get history by ID' })
	@ApiParam({ name: 'id', description: 'User ID.', example: 1 })
	@ApiOkResponse({ description: 'Finished game history returned successfully' })
	getHistory(@Param('id', ParseIntPipe) id: number) {
		return this.matchServices.getFinishedGamesHistory(id);
	}

	/**
	 * @description Returns a public user profile by ID.
	 * @param id - User ID.
	 * @returns Safe public user profile.
	 */
	@Get(':id')
	@ApiOperation({ summary: 'Get user by ID' })
	@ApiParam({ name: 'id', description: 'User ID.', example: 1 })
	@ApiOkResponse({ description: 'User returned successfully' })
	@ApiNotFoundResponse({ description: 'User not found' })
	getUser(@Param('id', ParseIntPipe) id: number) {
		return this.usersService.getUser(id);
	}

	/**
	 * @description Updates the authenticated user's editable public profile fields.
	 * @param id - User ID from the route.
	 * @param updateUserDto - Validated profile update body.
	 * @param req - Authenticated request containing the current user ID.
	 * @returns Updated safe public user profile.
	 * @throws ForbiddenException when a user tries to update another account.
	 * @remarks Authorization uses req.user.sub, not frontend state.
	 */
	@Patch(':id')
	@ApiOperation({ summary: 'Update user' })
	@ApiParam({ name: 'id', description: 'User ID.', example: 1 })
	@ApiBody({ type: UpdateUserDto })
	@ApiOkResponse({ description: 'User updated successfully' })
	@ApiBadRequestResponse({ description: 'Invalid update payload' })
	@ApiForbiddenResponse({ description: 'Authenticated user cannot update another account' })
	@ApiConflictResponse({ description: 'Username already exists' })
	@ApiNotFoundResponse({ description: 'User not found' })
	updateUser(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateUserDto: UpdateUserDto,
		@Req() req: AuthRequest,
	) {
		if (req.user.sub !== id) {
			throw new ForbiddenException('ERR_USER_UPDATE_FORBIDDEN');
		}

		return this.usersService.updateUser(id, updateUserDto);
	}
}
