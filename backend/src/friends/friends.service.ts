import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
	ForbiddenException,
} from '@nestjs/common';
import { FriendStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FriendRequestAction } from './dto/respond-friend-request.dto';
import { MAX_PENDING_FRIEND_REQUESTS, MAX_FRIEND_RESULTS} from './friends.constants';

@Injectable()
export class FriendsService {
	constructor(private readonly prisma: PrismaService) {}

	async sendFriendRequest(senderId: number, receiverId: number) {
		if (senderId === receiverId) {
			throw new BadRequestException(
				'ERR_FRIEND_SELF_REQUEST',
			);
		}

		const receiver = await this.prisma.user.findUnique({
			where: { id: receiverId },
			select: { id: true },
		});

		if (!receiver) {
			throw new NotFoundException('ERR_USER_NOT_FOUND');
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
				throw new ConflictException('ERR_FRIEND_ALREADY_FRIENDS');
			}

			throw new ConflictException(
				'ERR_FRIEND_REQUEST_EXISTS',
			);
		}

		const pendingOutgoingCount = await this.prisma.friend.count({
			where: {
				senderId,
				status: FriendStatus.PENDING,
			},
		});

		if (pendingOutgoingCount >= MAX_PENDING_FRIEND_REQUESTS) {
			throw new BadRequestException(
				'ERR_FRIEND_TOO_MANY_REQUESTS',
			);
		}

		try {
			const request = await this.prisma.friend.create({
				data: {
					senderId,
					receiverId,
					userAId,
					userBId,
					status: FriendStatus.PENDING,
				},
				select: {
					id: true,
					status: true,
					createdAt: true,
				},
			});

			return {
				requestId: request.id,
				status: request.status,
				createdAt: request.createdAt,
			};
		} catch (error) {
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === 'P2002'
			) {
				throw new ConflictException(
					'ERR_FRIEND_REQUEST_EXISTS',
				);
			}

			throw error;
		}
	}

	async getIncomingRequests(userId: number) {
		const requests = await this.prisma.friend.findMany({
			where: {
				receiverId: userId,
				status: FriendStatus.PENDING,
			},
			take: MAX_FRIEND_RESULTS,
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
			take: MAX_FRIEND_RESULTS,
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
			throw new NotFoundException('ERR_FRIEND_REQUEST_NOT_FOUND');
		}

		if (request.receiverId !== userId) {
			throw new ForbiddenException(
				'ERR_FRIEND_RESPONSE_FORBIDDEN',
			);
		}

		if (request.status !== FriendStatus.PENDING) {
			throw new ConflictException('ERR_FRIEND_NOT_PENDING');
		}

		if (action === FriendRequestAction.DECLINE) {
			await this.prisma.friend.delete({
				where: { id: requestId },
			});

			return {
				message: 'FRIEND_REQUEST_DECLINED',
			};
		}

		const updatedRequest = await this.prisma.friend.update({
			where: { id: requestId },
			data: {
				status: FriendStatus.ACCEPTED,
			},
			select: {
				id: true,
				status: true,
				updatedAt: true,
			},
		});

		return {
			friendshipId: updatedRequest.id,
			status: updatedRequest.status,
			updatedAt: updatedRequest.updatedAt,
		};
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
			take: MAX_FRIEND_RESULTS,
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
			throw new NotFoundException('ERR_FRIENDSHIP_NOT_FOUND');
		}

		if (friendship.status !== FriendStatus.ACCEPTED) {
			throw new BadRequestException('ERR_FRIEND_REMOVE_NOT_ACCEPTED');
		}

		if (
			friendship.senderId !== userId &&
			friendship.receiverId !== userId
		) {
			throw new ForbiddenException(
				'ERR_FRIEND_REMOVE_FORBIDDEN',
			);
		}

		await this.prisma.friend.delete({
			where: { id: friendshipId },
		});

		return {
			message: 'FRIEND_REMOVED_SUCCESS',
		};
	}
}
