import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { fileTypeFromBuffer } from 'file-type';
import { PrismaService } from '../prisma/prisma.service';
import {
	AVATAR_ALLOWED_MIME_TYPES,
	AVATAR_MAX_FILE_SIZE,
} from './avatar.constants';
import { UpdateUserDto } from './dto/update-user.dto';

const publicUserSelect = {
	id: true,
	username: true,
	bio: true,
	avatar: true,
	wins: true,
	losses: true,
	draws: true,
	xp: true,
} satisfies Prisma.UserSelect;

type PublicUser = Prisma.UserGetPayload<{
	select: typeof publicUserSelect;
}>;

@Injectable()
export class UsersService {
	constructor(private readonly prisma: PrismaService) {}

	/**
	 * @description Maps a selected user into the public API response shape.
	 * @param user - User selected with publicUserSelect.
	 * @returns Safe public user profile.
	 * @remarks This response must never expose email, passwordHash, or 2FA secrets.
	 */
	private toPublicUser(user: PublicUser): PublicUser {
		return {
			id: user.id,
			username: user.username,
			bio: user.bio,
			avatar: user.avatar,
			wins: user.wins,
			losses: user.losses,
			draws: user.draws,
			xp: user.xp,
		};
	}

	/**
	 * @description Returns paginated public users with optional username search.
	 * @param query - Pagination and search query parameters.
	 * @returns Safe public user list.
	 */
	async getUsers(query: {
		limit?: number;
		offset?: number;
		search?: string;
	}): Promise<PublicUser[]> {
		const limit = Math.min(query.limit ?? 20, 100);
		const offset = query.offset ?? 0;

		const search = query.search?.trim();

		if (query.search !== undefined && search === '') {
			throw new BadRequestException(
				'ERR_QUERY_SEARCH_EMPTY',
			);
		}

		const where = search
			? {
					username: {
						contains: search,
						mode: 'insensitive' as const,
					},
				}
			: {};

		const users = await this.prisma.user.findMany({
			where,
			select: publicUserSelect,
			take: limit,
			skip: offset,
		});

		return users.map((user) =>
			this.toPublicUser(user),
		);
	}

	/**
	 * @description Returns a public user profile by ID.
	 * @param id - Target user ID.
	 * @returns Safe public user profile.
	 * @throws NotFoundException when the user does not exist.
	 */
	async getUser(id: number): Promise<PublicUser> {
		const user = await this.prisma.user.findUnique({
			where: { id },
			select: publicUserSelect,
		});

		if (!user) {
			throw new NotFoundException(
				'ERR_USER_NOT_FOUND',
			);
		}

		return this.toPublicUser(user);
	}

	/**
	 * @description Updates the authenticated user's editable public profile fields.
	 * @param id - Authenticated user ID.
	 * @param updateUserDto - Validated public profile update payload.
	 * @returns Updated safe public profile.
	 * @throws ConflictException when the username already exists.
	 * @remarks Authorization must be enforced before this service method is called.
	 */
	async updateUser(
		id: number,
		updateUserDto: UpdateUserDto,
	): Promise<PublicUser> {
		const user = await this.prisma.user.findUnique({
			where: { id },
			select: { id: true },
		});

		if (!user) {
			throw new NotFoundException(
				'ERR_USER_NOT_FOUND',
			);
		}

		try {
			const updatedUser =
				await this.prisma.user.update({
					where: { id },
					data: updateUserDto,
					select: publicUserSelect,
				});

			return this.toPublicUser(updatedUser);
		} catch (error: unknown) {
			if (
				error instanceof
					Prisma.PrismaClientKnownRequestError &&
				error.code === 'P2002'
			) {
				throw new ConflictException(
					'ERR_AUTH_ALREADY_EXISTS',
				);
			}

			throw new BadRequestException(
				'ERR_USER_UPDATE_FAILED',
			);
		}
	}

	/**
	 * @description Validates and updates the authenticated user's avatar image.
	 * @param userId - Authenticated user ID.
	 * @param file - Uploaded avatar file.
	 * @returns Updated safe public profile.
	 * @throws BadRequestException when the file is missing or invalid.
	 * @remarks File type validation is based on file signature detection, not only MIME headers.
	 */
	async updateAvatar(
		userId: number,
		file: Express.Multer.File | undefined,
	): Promise<PublicUser> {
		if (!file) {
			throw new BadRequestException(
				'ERR_USER_AVATAR_REQUIRED',
			);
		}

		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: { id: true },
		});

		if (!user) {
			throw new NotFoundException(
				'ERR_USER_NOT_FOUND',
			);
		}

		if (file.size > AVATAR_MAX_FILE_SIZE) {
			throw new BadRequestException(
				'ERR_USER_AVATAR_TOO_LARGE',
			);
		}

		const detectedFileType =
			await fileTypeFromBuffer(file.buffer);

		if (
			!detectedFileType ||
			!AVATAR_ALLOWED_MIME_TYPES.some(
				(mime) => mime === detectedFileType.mime,
			)
		) {
			throw new BadRequestException(
				'ERR_USER_AVATAR_INVALID_TYPE',
			);
		}

		const avatarDataUrl =
			`data:${detectedFileType.mime};base64,${file.buffer.toString('base64')}`;

		const updatedUser =
			await this.prisma.user.update({
				where: { id: userId },
				data: {
					avatar: avatarDataUrl,
				},
				select: publicUserSelect,
			});

		return this.toPublicUser(updatedUser);
	}

	/**
	 * @description Returns a public user profile from an exact username match.
	 * @param username - Exact username.
	 * @returns Safe public user profile.
	 * @throws NotFoundException when no user matches the username.
	 */
	async getUserByUsername(username: string): Promise<PublicUser> {
		const user = await this.prisma.user.findUnique({
			where: { username },
			select: publicUserSelect,
		});

		if (!user) {
			throw new NotFoundException(
				'ERR_USER_NOT_FOUND',
			);
		}

		return this.toPublicUser(user);
	}

	/**
	 * @description Calculates the global XP rank of a user.
	 * @param id - User ID.
	 * @returns User XP and 1-based global rank.
	 * @throws NotFoundException when the user does not exist.
	 */
	async getUserRank(id: number): Promise<{ rank: number; xp: number }> {
		const user = await this.prisma.user.findUnique({
			where: { id },
			select: { xp: true },
		});

		if (!user) {
			throw new NotFoundException(
				'ERR_USER_NOT_FOUND',
			);
		}

		const higherXpPlayersCount =
			await this.prisma.user.count({
				where: {
					xp: {
						gt: user.xp,
					},
				},
			});

		return {
			rank: higherXpPlayersCount + 1,
			xp: user.xp,
		};
	}
}
