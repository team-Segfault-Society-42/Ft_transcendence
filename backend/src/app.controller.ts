import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from './auth/public.decorator';
import { AppService } from './app.service';

@ApiTags('App')
@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	/**
	 * @description Public test endpoint used to verify that the backend is reachable.
	 * @returns Static backend hello response.
	 */
	@Public()
	@Get('hello')
	@ApiOperation({ summary: 'Get simple message from backend' })
	@ApiOkResponse({ description: 'Backend hello message returned successfully' })
	getHello() {
		return this.appService.getHello();
	}
}
