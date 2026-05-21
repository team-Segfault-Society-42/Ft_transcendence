import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { fileTypeFromBuffer } from 'file-type';
import {
	AVATAR_ALLOWED_MIME_TYPES,
	AVATAR_MAX_FILE_SIZE,
} from './avatar.constants';

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
	constructor(private prisma: PrismaService) {}

	private toPublicUser(user: PublicUser) {
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

	async getUsers(query: { limit?: number; offset?: number; search?: string }) {
		const limit = Math.min(query.limit ?? 20, 100);
		const offset = query.offset ?? 0;
		const search = query.search?.trim();
		if (query.search !== undefined && search === '') {
			throw new BadRequestException('ERR_QUERY_SEARCH_EMPTY');
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


		return users.map(user => this.toPublicUser(user));
	}

	async getUser(id: number) {
		const user = await this.prisma.user.findUnique({
			where: { id },
			select: publicUserSelect,
		});

		if (!user)
			throw new NotFoundException('ERR_USER_NOT_FOUND');

		return this.toPublicUser(user);
	}

	async updateUser(id: number, updateUserDto: UpdateUserDto) {
		const user = await this.prisma.user.findUnique({
			where: { id },
			select: { id: true },
		});

		if (!user) {
			throw new NotFoundException('ERR_USER_NOT_FOUND');
		}

		try {
			const updatedUser = await this.prisma.user.update({
				where: { id },
				data: updateUserDto,
			});

			return this.toPublicUser(updatedUser);
		} catch (error) {
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === 'P2002'
			) {
				throw new ConflictException('ERR_AUTH_ALREADY_EXISTS');
			}

			throw new BadRequestException('ERR_USER_UPDATE_FAILED');
		}
	}

	async updateAvatar(userId: number, file: Express.Multer.File | undefined) {
		if (!file) {
			throw new BadRequestException('ERR_USER_AVATAR_REQUIRED');
		}

		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: { id: true },
		});

		if (!user) {
			throw new NotFoundException('ERR_USER_NOT_FOUND');
		}

		if (file.size > AVATAR_MAX_FILE_SIZE) {
			throw new BadRequestException('ERR_USER_AVATAR_TOO_LARGE');
		}

		const detectedFileType = await fileTypeFromBuffer(file.buffer);

		if (
			!detectedFileType ||
			!AVATAR_ALLOWED_MIME_TYPES.some((mime) => mime === detectedFileType.mime)
		) {
			throw new BadRequestException('ERR_USER_AVATAR_INVALID_TYPE');
		}

		const avatarDataUrl = `data:${detectedFileType.mime};base64,${file.buffer.toString('base64')}`;

		const updatedUser = await this.prisma.user.update({
			where: { id: userId },
			data: { avatar: avatarDataUrl },
			select: publicUserSelect,
		});

		return this.toPublicUser(updatedUser);
	}

	async getUserByUsername(username: string) {
		const user = await this.prisma.user.findUnique({
			where: { username },
			select: publicUserSelect
		})

		if (!user)
			throw new NotFoundException('ERR_USER_NOT_FOUND');

		return this.toPublicUser(user);
	}

	async getUserRank(id: number) {
		const user = await this.prisma.user.findUnique({
			where: { id },
			select: { xp: true }
		})
		if (!user)
			throw new NotFoundException('ERR_USER_NOT_FOUND');

		const higherXpPlayersCount = await this.prisma.user.count({
			where: { xp: { gt: user.xp } }
		})

		return { 
			rank: higherXpPlayersCount + 1, 
			xp: user.xp 
		}
	}

}