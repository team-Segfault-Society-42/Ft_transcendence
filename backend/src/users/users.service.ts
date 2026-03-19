import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto} from './dto/update-user.dto';

@Injectable()
export class UsersService {

	private users = [
		{
			id : 1,
			username : "simo_42",
			wins : 0,
			losses : 282344,
			draws : 0,
			bio : "The best",
			avatar: "avatar.png"
		}
	];

	getUsers(){
		return this.users;
	}

	getUser(id:  number){
		const user = this.users.find(user => user.id === id);//this.users.find(({ id: userId }) => userId === id);//is the same


		if(!user) {
			throw new NotFoundException('User not found');
		}
		return user;
	}

	updateUser(id: number, updateUserDto: UpdateUserDto) {
		const user = this.users.find(user => user.id === id);

		if(!user) {
			throw new NotFoundException('User not found');
		}

		Object.assign(user, updateUserDto);

		return user;
	}
}

