import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
// import { CreateUserDto } from './dto/create-user.dto';

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
		const where = query.search
			? {
					username: {
						contains: query.search,
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
			throw new NotFoundException('User not found');

		return this.toPublicUser(user);
	}

	async updateUser(id: number, updateUserDto: UpdateUserDto) {
		const user = await this.prisma.user.findUnique({
			where: { id },
			select: { id: true },
		});

		if (!user) {
			throw new NotFoundException('User not found');
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
				throw new ConflictException('Username already exists');
			}

			throw new BadRequestException('Failed to update user');
		}
	}
}
