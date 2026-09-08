import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerLimitDetail } from '@nestjs/throttler';

// Mismo comportamiento que ThrottlerGuard — solo cambia el mensaje de error, que por
// default es el crudo "ThrottlerException: Too Many Requests" de la librería.
@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
    protected async getErrorMessage(_context: ExecutionContext, _detail: ThrottlerLimitDetail): Promise<string> {
        return 'Too many requests. Please try again in a moment.';
    }
}
