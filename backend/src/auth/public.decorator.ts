import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a controller or route handler as public.
 *
 * @remarks The global JwtAuthGuard checks this metadata before requiring an access_token.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
