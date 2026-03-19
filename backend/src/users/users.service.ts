import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
	constructor(private prisma: PrismaService) {}

	async getUsers() {
		return this.prisma.user.findMany();
	}

	async getUser(id: number) {
		const user = await this.prisma.user.findUnique({
			where: { id },
		});

	if (!user) {
		throw new NotFoundException('User not found');
	}

	return user;
	}

	async updateUser(id: number, updateUserDto: UpdateUserDto) {
		const user = await this.prisma.user.findUnique({
			where: { id },
		});

	if (!user) {
		throw new NotFoundException('User not found');
	}

	return this.prisma.user.update({
		where: { id },
		data: updateUserDto,
	});
	}
}
