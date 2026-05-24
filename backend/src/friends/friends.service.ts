import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Inject,
	Injectable,
	forwardRef,
	NotFoundException,
} from '@nestjs/common';
import { FriendStatus, Prisma } from '@prisma/client';
import { GameService } from '../modules/game/game.service';
import { PresenceService } from '../presence/presence.service';
import { PrismaService } from '../prisma/prisma.service';
import {
	MAX_FRIEND_RESULTS,
	MAX_PENDING_FRIEND_REQUESTS,
} from './friends.constants';
import { FriendRequestAction } from './dto/respond-friend-request.dto';
import { FRIEND_EVENTS } from './friends.events';

const publicFriendUserSelect = {
	id: true,
	username: true,
	bio: true,
	avatar: true,
	wins: true,
	losses: true,
	draws: true,
	xp: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class FriendsService {
	constructor(
		private readonly prisma: PrismaService,

		@Inject(forwardRef(() => PresenceService))
		private readonly presenceService: PresenceService,

		@Inject(forwardRef(() => GameService))
		private readonly gameService: GameService,
	) {}

	/**
	 * @description Returns normalized friendship ordering used by the unique friendship constraint.
	 * @param senderId - Current authenticated user ID.
	 * @param receiverId - Target user ID.
	 * @returns Stable friendship pair ordering.
	 * @remarks userAId/userBId prevents duplicated inverse friendships.
	 */
	private createFriendPair(senderId: number, receiverId: number) {
		return {
			userAId: Math.min(senderId, receiverId),
			userBId: Math.max(senderId, receiverId),
		};
	}

	/**
	 * @description Emits the same realtime friend event to both affected users.
	 * @param userAId - First affected user.
	 * @param userBId - Second affected user.
	 * @param event - Friend event name.
	 * @returns Nothing.
	 */
	private emitFriendEventToUsers(
		userAId: number,
		userBId: number,
		event: string,
	): void {
		this.presenceService.emitFriendEvent(userAId, event);
		this.presenceService.emitFriendEvent(userBId, event);
	}

	/**
	 * @description Returns the other user ID from an accepted friendship.
	 * @param friendship - Friendship row containing sender/receiver IDs.
	 * @param currentUserId - Current authenticated user ID.
	 * @returns Friend user ID.
	 */
	private getFriendId(
		friendship: {
			senderId: number;
			receiverId: number;
		},
		currentUserId: number,
	): number {
		return friendship.senderId === currentUserId
			? friendship.receiverId
			: friendship.senderId;
	}

	/**
	 * @description Returns accepted friendships involving the authenticated user.
	 * @param userId - Current authenticated user ID.
	 * @returns Accepted friendship rows.
	 */
	private async getAcceptedFriendships(userId: number) {
		return this.prisma.friend.findMany({
			where: {
				status: FriendStatus.ACCEPTED,
				OR: [
					{ senderId: userId },
					{ receiverId: userId },
				],
			},
			take: MAX_FRIEND_RESULTS,
		});
	}

	/**
	 * @description Sends a pending friend request from the authenticated user to another user.
	 * @param senderId - Current authenticated user ID.
	 * @param receiverId - Target user ID.
	 * @returns Friend request summary.
	 * @throws BadRequestException when requesting self or too many pending requests exist.
	 * @throws ConflictException when friendship/request already exists.
	 * @throws NotFoundException when the target user does not exist.
	 */
	async sendFriendRequest(senderId: number, receiverId: number) {
		if (senderId === receiverId) {
			throw new BadRequestException('ERR_FRIEND_SELF_REQUEST');
		}

		const receiver = await this.prisma.user.findUnique({
			where: { id: receiverId },
			select: { id: true },
		});

		if (!receiver) {
			throw new NotFoundException('ERR_USER_NOT_FOUND');
		}

		const { userAId, userBId } = this.createFriendPair(
			senderId,
			receiverId,
		);

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

			throw new ConflictException('ERR_FRIEND_REQUEST_EXISTS');
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

			this.emitFriendEventToUsers(
				senderId,
				receiverId,
				FRIEND_EVENTS.REQUEST_SENT,
			);

			this.presenceService.emitFriendEvent(
				receiverId,
				FRIEND_EVENTS.REQUEST_RECEIVED,
			);

			return {
				requestId: request.id,
				status: request.status,
				createdAt: request.createdAt,
			};
		} catch (error: unknown) {
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

	/**
	 * @description Returns incoming pending friend requests.
	 * @param userId - Current authenticated user ID.
	 * @returns Pending incoming requests with safe sender data.
	 */
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
					select: publicFriendUserSelect,
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

	/**
	 * @description Returns outgoing pending friend requests.
	 * @param userId - Current authenticated user ID.
	 * @returns Pending outgoing requests with safe receiver data.
	 */
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
					select: publicFriendUserSelect,
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

	/**
	 * @description Accepts or declines a pending friend request.
	 * @param userId - Current authenticated user ID.
	 * @param requestId - Pending friend request ID.
	 * @param action - Accept or decline action.
	 * @returns Friendship summary or decline confirmation.
	 * @remarks Only the receiver of the pending request may respond.
	 */
	async respondToFriendRequest(
		userId: number,
		requestId: number,
		action: FriendRequestAction,
	) {
		const request = await this.prisma.friend.findUnique({
			where: { id: requestId },
			select: {
				id: true,
				senderId: true,
				receiverId: true,
				status: true,
			},
		});

		if (!request) {
			throw new NotFoundException(
				'ERR_FRIEND_REQUEST_NOT_FOUND',
			);
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

			this.emitFriendEventToUsers(
				userId,
				request.senderId,
				FRIEND_EVENTS.REQUEST_DECLINED,
			);

			return {
				message: 'FRIEND_REQUEST_DECLINED',
			};
		}

		const updatedCount = await this.prisma.friend.updateMany({
			where: {
				id: requestId,
				status: FriendStatus.PENDING,
				receiverId: userId,
			},
			data: {
				status: FriendStatus.ACCEPTED,
			},
		});

		if (updatedCount.count !== 1) {
			throw new ConflictException('ERR_FRIEND_NOT_PENDING');
		}

		const updatedRequest = await this.prisma.friend.findUnique({
			where: { id: requestId },
			select: {
				id: true,
				status: true,
				updatedAt: true,
			},
		});

		if (!updatedRequest) {
			throw new NotFoundException(
				'ERR_FRIEND_REQUEST_NOT_FOUND',
			);
		}

		this.emitFriendEventToUsers(
			userId,
			request.senderId,
			FRIEND_EVENTS.REQUEST_ACCEPTED,
		);

		return {
			friendshipId: updatedRequest.id,
			status: updatedRequest.status,
			updatedAt: updatedRequest.updatedAt,
		};
	}

	/**
	 * @description Returns accepted friends for the authenticated user.
	 * @param userId - Current authenticated user ID.
	 * @returns Accepted friendships with safe public friend data.
	 */
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
					select: publicFriendUserSelect,
				},
				receiver: {
					select: publicFriendUserSelect,
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

	/**
	 * @description Removes an accepted friendship involving the authenticated user.
	 * @param userId - Current authenticated user ID.
	 * @param friendshipId - Accepted friendship ID.
	 * @returns Frontend translation message key.
	 * @throws ForbiddenException when the user is not part of the friendship.
	 */
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
			throw new BadRequestException(
				'ERR_FRIEND_REMOVE_NOT_ACCEPTED',
			);
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

		this.emitFriendEventToUsers(
			friendship.senderId,
			friendship.receiverId,
			FRIEND_EVENTS.FRIEND_REMOVED,
		);

		return {
			message: 'FRIEND_REMOVED_SUCCESS',
		};
	}

	/**
	 * @description Returns realtime online and game activity status for accepted friends.
	 * @param userId - Current authenticated user ID.
	 * @returns Friend realtime status summaries.
	 */
	async getFriendsStatus(userId: number) {
		const friendships = await this.getAcceptedFriendships(userId);

		return friendships.map((friendship) => {
			const friendId = this.getFriendId(friendship, userId);

			const online =
				this.presenceService.isUserOnline(friendId);

			return {
				userId: friendId,
				online,
				inGame:
					online &&
					this.gameService.isUserInGame(friendId),
				activity: online
					? this.gameService.getUserGameActivity(friendId)
					: 'offline',
			};
		});
	}

	/**
	 * @description Returns accepted friend IDs for realtime presence broadcasting.
	 * @param userId - Current authenticated user ID.
	 * @returns Friend user IDs only.
	 */
	async getAcceptedFriendIds(userId: number): Promise<number[]> {
		const friendships = await this.getAcceptedFriendships(userId);

		return friendships.map((friendship) =>
			this.getFriendId(friendship, userId),
		);
	}
}
