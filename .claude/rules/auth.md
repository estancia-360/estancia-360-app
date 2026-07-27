# app/auth/ — Auth Reference

JWT authentication with refresh token rotation. Refresh tokens are stored hashed — never in plain text.

## Guards (applied globally via APP_GUARD in auth.module.ts)
- **JwtAuthGuard** — verifies the JWT on every request. Routes marked `@Public()` are exempt.
- **RolesGuard** — checks `user.roleId <= requiredRole`. Routes without `@RootOnly/AdminUp/UserUp` are exempt.
Both guards are registered as `APP_GUARD` — removing `AuthModule` from `AppModule` disables them globally.

## Decorators
```typescript
import { Public, CurrentUser } from 'src/app/auth/decorators';
import { AdminUp, RootOnly, UserUp, Roles } from 'src/app/auth/decorators';
import type { AuthUser } from 'src/app/auth/strategies/jwt.strategy';

@Public()            // bypass JwtAuthGuard for this route
@RootOnly()          // roleId must be 1 (root) — also adds @ApiForbiddenResponse
@AdminUp()           // roleId must be ≤ 2 (admin or root)
@UserUp()            // roleId must be ≤ 3 (any authenticated user)
// In controllers always use the above — never raw @Roles(n)

@CurrentUser()               // → AuthUser = { id, email, roleId }
@CurrentUser('id')           // → number
@CurrentUser('roleId')       // → number
```

## JWT Payload and AuthUser
```typescript
// What is signed into the token (JwtPayload):
{ sub: number, email: string, roleId: number }

// What JwtStrategy puts into req.user (AuthUser):
{ id: number, email: string, roleId: number }
```

## UserForAuthDto — internal auth DTO
```typescript
import { UserForAuthDto } from 'src/modules/users/dto/user-for-auth.dto';

// Used in auth.service.ts — includes password and refreshToken
const user = await usersService.findOneByEmail(UserForAuthDto, email, { throwException: false });
// user.password, user.refreshToken are available

// NEVER return UserForAuthDto in an HTTP response.
// For public-facing user data always use UserDto.
```

## Token Rotation (refresh)
1. Client sends refresh token → server verifies signature and expiry.
2. Server compares `bcrypt.compare(refreshToken, user.refreshToken)` (stored as hash).
3. If match → issue new access + refresh pair, revoke old refresh token.
4. If mismatch (reuse detected) → revoke ALL sessions (`setRefreshToken(id, null)`).
Access tokens expire in `JWT_TIME_EXPIRE` (default 15m). Refresh tokens in `JWT_REFRESH_TIME_EXPIRE` (default 7d).

## Malleability — Adapting to a Different Users Table
If the users table doesn't have `email` / `password` (e.g., uses `username`):
1. Update `UserForAuthDto` fields to match the auth fields you need.
2. Update `auth.service.ts login()` — replace `findOneByEmail` with the appropriate lookup.
3. Keep everything else (JWT, rotation, guards, decorators) as-is.
Role hierarchy numbers (1/2/3) can be changed in `RoleEntity` + seed + guard comparison.

## Auth Exceptions (`src/app/auth/exceptions/`)
- `InvalidCredentialsException` → 401 `INVALID_CREDENTIALS`
- `InvalidRefreshTokenException` → 401 `INVALID_REFRESH_TOKEN`
- `InvalidTokenException` → 401 `INVALID_TOKEN` (thrown by JwtAuthGuard)
- `InsufficientPermissionsException` → 403 `INSUFFICIENT_PERMISSIONS` (thrown by RolesGuard)
