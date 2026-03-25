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

const safeUserSelect = {
	id: true,
	email: true,
	username: true,
	bio: true,
	avatar: true,
	wins: true,
	losses: true,
	draws: true,
};

@Injectable()
export class UsersService {
	constructor(private prisma: PrismaService) {}

	async getUsers() {
		return this.prisma.user.findMany({
			select: safeUserSelect,
		});
	}

	async getUser(id: number) {
		const user = await this.prisma.user.findUnique({
			where: { id },
			select: safeUserSelect,
		});

		if (!user) {
			throw new NotFoundException('User not found');
		}

		return user;
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
			return await this.prisma.user.update({
				where: { id },
				data: updateUserDto,
				select: safeUserSelect,
			});
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

	// async createUser(createUserDto: CreateUserDto) {
	// 	try {
	// 		return await this.prisma.user.create({
	// 			data: {
	// 				username: createUserDto.username,
	// 				bio: createUserDto.bio ?? '',
	// 				avatar: createUserDto.avatar ?? 'default.png',
	// 				wins: 0,
	// 				losses: 0,
	// 				draws: 0,
	// 			},
	// 		});
	// 	} catch (error) {
	// 		if (
	// 			error instanceof Prisma.PrismaClientKnownRequestError &&
	// 			error.code === 'P2002'
	// 		) {
	// 			throw new ConflictException('Username already exists');
	// 		}

	// 		throw new BadRequestException('Failed to create user');
	// 	}
	// }
}
