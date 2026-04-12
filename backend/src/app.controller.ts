import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@ApiOperation({ summary: 'Get simple message from backend' })
	@Get('hello')
	getHello() {
		return this.appService.getHello();
	}
}
