# shared/ — Utilities Reference

Everything in `src/shared/` is usable from any module. Nothing here imports from `modules/` or `app/`.

## DtoRepository (`src/shared/orm`)
Wraps TypeORM `Repository<E>` with automatic SELECT + JOIN derived from the DTO class.
```typescript
private readonly repo: DtoRepository<User>;
constructor(@InjectRepository(User) private readonly rawRepo: Repository<User>) {
    this.repo = new DtoRepository(rawRepo);
}
// Usage
const result = await this.repo.findOne({ dto: UserDto, where: { id } });
const page   = await this.repo.findPaginated({ dto: UserDto, pagination: params, where: {}, order: {} });
// In mutations — builds from the same repo for transaction safety:
const saved = await repo.save(entity);
return (await new DtoRepository(repo).findOne({ dto: returnDto, where: { id: saved.id } }))!;
```

## @DtoField and @DtoRelation
Decorators that drive both TypeORM SELECT and class-transformer serialization.
```typescript
import { DtoField, DtoRelation } from 'src/shared/orm';

export class ProductDto {
    @DtoField() id!: number;           // scalar → SELECT product_id
    @DtoField() name!: string;          // scalar → SELECT name
    @DtoField() createdAt!: Date;
    @DtoRelation(() => CategoryDto)     // relation → LEFT JOIN categories
    category!: CategoryDto;
}
```
Only `@DtoField` / `@DtoRelation` fields are included in SELECT — adding a field to the DTO automatically includes it in all queries.

## FindOptions and MutationOptions
```typescript
import { FindOptions, MutationOptions } from 'src/shared/dto';

// FindOptions
{ throwException?: boolean }  // false = return null instead of throwing NotFoundException

// MutationOptions
{ manager?: EntityManager, hardDelete?: boolean }
// manager  = pass an EntityManager to run inside an existing transaction
// hardDelete = true → repo.delete(), false (default) → repo.softDelete()
```

## Pagination
```typescript
// Params DTO
export class FindAllProductsParamsDto extends PaginationParamsDto { ... }
// PaginationParamsDto has: page (default 1), limit (default 10)

// Response DTO
export class FindAllProductsResponseDto extends PaginationResponseDto<ProductDto> {
    @ApiProperty({ type: [ProductDto] }) declare data: ProductDto[];
}
// PaginationResponseDto has: data[], meta: { page, limit, total, pages }
```

## Swagger Response Decorators (`src/shared/utils/swagger`)
All decorators are **variadic** — pass one or many `{ code, message }` objects.
Multiple errors for the same status produce a dropdown in Swagger UI.
```typescript
import { ApiNotFound, ApiConflict, ApiUnauthorized, ApiForbidden,
         ApiValidationError, ApiUnprocessableEntity } from 'src/shared/utils/swagger';

@ApiNotFound({ code: 'PRODUCT_NOT_FOUND', message: 'Product not found.' })
@ApiConflict({ code: 'PRODUCT_ALREADY_EXISTS', message: 'A product with this name already exists.' })
@ApiUnauthorized({ code: 'INVALID_TOKEN', message: 'Invalid or expired token.' })
@ApiForbidden({ code: 'INSUFFICIENT_PERMISSIONS', message: 'You do not have permission.' })
@ApiValidationError()  // 400 — class-validator format (always no-args)

// Multiple codes for same status:
@ApiUnauthorized(
    { code: 'INVALID_TOKEN',       message: 'Invalid or expired token.' },
    { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials.' },
)
```
Response body shape (all non-400): `{ statusCode, error, message, path, timestamp }`

## HttpExceptionFilter
Global filter in `src/shared/filters/http-exception.filter.ts`.
Normalizes ALL HttpExceptions to: `{ statusCode, error, message, path, timestamp }`.
- When you pass `{ message, error }` to an exception constructor → `error` is your domain code.
- When you pass a plain string → `error` falls back to the HTTP status code label (e.g., `NOT_FOUND`).
- 500s are logged with stack trace; lower statuses are not.

## @CurrentUser Decorator
```typescript
import { CurrentUser } from 'src/shared/decorators';
import type { AuthUser } from 'src/app/auth/strategies/jwt.strategy';

// In a controller method:
async logout(@CurrentUser() user: AuthUser): Promise<void>
async getProfile(@CurrentUser('id') id: number): Promise<UserDto>
// AuthUser = { id, email, roleId } — what JwtStrategy puts in req.user
```

## Other Shared Utilities
- `src/shared/utils/crypto.util.ts` → `hashPassword(plain)`, `comparePassword(plain, hash)` (bcrypt)
- `src/shared/utils/code-generator.util.ts` → `generateCode(length)` random alphanumeric
- `src/shared/utils/transformers.util.ts` → `transformToBoolean(value, name)` for query params
- `src/shared/dto/error-response.dto.ts` → Swagger schema for error responses
- `src/shared/enums/environment.enum.ts` → `EnvironmentEnum` (development, production, test, debug)
