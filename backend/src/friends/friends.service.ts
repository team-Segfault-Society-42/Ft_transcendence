import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
	ForbiddenException,
} from '@nestjs/common';
import { FriendStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FriendRequestAction } from './dto/respond-friend-request.dto';

@Injectable()
export class FriendsService {
	constructor(private readonly prisma: PrismaService) {}

	async sendFriendRequest(senderId: number, receiverId: number) {
		if (senderId === receiverId) {
			throw new BadRequestException(
				'You cannot send a friend request to yourself',
			);
		}

		const receiver = await this.prisma.user.findUnique({
			where: { id: receiverId },
			select: { id: true },
		});

		if (!receiver) {
			throw new NotFoundException('User not found');
		}

		const userAId = Math.min(senderId, receiverId);
		const userBId = Math.max(senderId, receiverId);

		const existingFriendship = await this.prisma.friend.findUnique({
			where: {
				userAId_userBId: {
					userAId,
					userBId,
				},
			},
			select: {
				id: true,
				status: true,
			},
		});

		if (existingFriendship) {
			if (existingFriendship.status === FriendStatus.ACCEPTED) {
				throw new ConflictException('Users are already friends');
			}

			throw new ConflictException(
				'Friend request already exists',
			);
		}

		return this.prisma.friend.create({
			data: {
				senderId,
				receiverId,
				userAId,
				userBId,
				status: FriendStatus.PENDING,
			},
		});
	}

	async getIncomingRequests(userId: number) {
		const requests = await this.prisma.friend.findMany({
			where: {
				receiverId: userId,
				status: FriendStatus.PENDING,
			},
			select: {
				id: true,
				createdAt: true,
				sender: {
					select: {
						id: true,
						username: true,
						bio: true,
						avatar: true,
						wins: true,
						losses: true,
						draws: true,
						xp: true,
					},
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		});

		return requests.map((request) => ({
			requestId: request.id,
			sender: request.sender,
			createdAt: request.createdAt,
		}));
	}

	async getOutgoingRequests(userId: number) {
		const requests = await this.prisma.friend.findMany({
			where: {
				senderId: userId,
				status: FriendStatus.PENDING,
			},
			select: {
				id: true,
				createdAt: true,
				receiver: {
					select: {
						id: true,
						username: true,
						bio: true,
						avatar: true,
						wins: true,
						losses: true,
						draws: true,
						xp: true,
					},
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		});

		return requests.map((request) => ({
			requestId: request.id,
			receiver: request.receiver,
			createdAt: request.createdAt,
		}));
	}

	async respondToFriendRequest(
		userId: number,
		requestId: number,
		action: FriendRequestAction,
	) {
		const request = await this.prisma.friend.findUnique({
			where: { id: requestId },
			select: {
				id: true,
				receiverId: true,
				status: true,
			},
		});

		if (!request) {
			throw new NotFoundException('Friend request not found');
		}

		if (request.receiverId !== userId) {
			throw new ForbiddenException(
				'You can only respond to friend requests sent to you',
			);
		}

		if (request.status !== FriendStatus.PENDING) {
			throw new ConflictException('Friend request is not pending');
		}

		if (action === FriendRequestAction.DECLINE) {
			await this.prisma.friend.delete({
				where: { id: requestId },
			});

			return {
				message: 'Friend request declined',
			};
		}

		const updatedRequest = await this.prisma.friend.update({
			where: { id: requestId },
			data: {
				status: FriendStatus.ACCEPTED,
			},
		});

		return updatedRequest;
	}

	async getFriends(userId: number) {
		const friendships = await this.prisma.friend.findMany({
			where: {
				status: FriendStatus.ACCEPTED,
				OR: [
					{ senderId: userId },
					{ receiverId: userId },
				],
			},
			select: {
				id: true,
				createdAt: true,
				senderId: true,
				receiverId: true,
				sender: {
					select: {
						id: true,
						username: true,
						bio: true,
						avatar: true,
						wins: true,
						losses: true,
						draws: true,
						xp: true,
					},
				},
				receiver: {
					select: {
						id: true,
						username: true,
						bio: true,
						avatar: true,
						wins: true,
						losses: true,
						draws: true,
						xp: true,
					},
				},
			},
			orderBy: {
				updatedAt: 'desc',
			},
		});

		return friendships.map((friendship) => ({
			friendshipId: friendship.id,
			friend:
				friendship.senderId === userId
					? friendship.receiver
					: friendship.sender,
			createdAt: friendship.createdAt,
		}));
	}

	async removeFriend(userId: number, friendshipId: number) {
		const friendship = await this.prisma.friend.findUnique({
			where: { id: friendshipId },
			select: {
				id: true,
				senderId: true,
				receiverId: true,
				status: true,
			},
		});

		if (!friendship) {
			throw new NotFoundException('Friendship not found');
		}

		if (friendship.status !== FriendStatus.ACCEPTED) {
			throw new BadRequestException('Only accepted friendships can be removed');
		}

		if (
			friendship.senderId !== userId &&
			friendship.receiverId !== userId
		) {
			throw new ForbiddenException(
				'You can only remove your own friendships',
			);
		}

		await this.prisma.friend.delete({
			where: { id: friendshipId },
		});

		return {
			message: 'Friend removed',
		};
	}
}
