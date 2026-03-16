import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UsersService {

	private users = [
		{
			id : 1,
			username : "nico_42",
			wins : 10,
			losses : 2,
			avatar: "placeholder.png"
		}
	];

	getUsers(){
		return (this.users);
	}

	getUser(id:  number){
		const user = this.users.find(user => user.id === id);

		if(!user) {
			throw new NotFoundException('User not found');
		}
		return (user);
	}
}

