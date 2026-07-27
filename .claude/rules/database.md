# database/ — TypeORM Reference

Driver: `postgres`. All config comes from env vars (see `src/config/CLAUDE.md`).

## BaseEntitySoftDelete (`src/database/entities/base.entity.ts`)
All entities must extend this. It provides:
```typescript
createdAt: Date   // @CreateDateColumn
updatedAt: Date   // @UpdateDateColumn
deletedAt: Date   // @DeleteDateColumn — set by softDelete(), null for active records
```
TypeORM automatically excludes soft-deleted rows from all `find*()` queries.
Use `{ withDeleted: true }` to include them.

## Entity Conventions
```typescript
@Entity('products')   // table name: snake_case plural
export class Product extends BaseEntitySoftDelete {
    @PrimaryGeneratedColumn({ name: 'product_id' }) id: number;   // always {entity}_id in DB
    @Column({ name: 'name', type: 'varchar', length: 150 }) name: string;
    @Column({ name: 'category_id', type: 'int' }) categoryId: number;
    @ManyToOne(() => Category, cat => cat.products)
    @JoinColumn({ name: 'category_id' })             // FK column must have @JoinColumn
    category: Category;
}
```

## Migrations
```bash
# Generate — compares entities vs DB schema:
npm run migration:generate -- src/database/migrations/<DescriptiveName>
# Run all pending:
npm run migration:run
# Revert last:
npm run migration:revert
```
Config: `src/database/config/data-source.ts`.
Never use `synchronize: true` in any environment — always use migrations.

## Transactions via MutationOptions
```typescript
// In a higher-level service that coordinates two modules:
await dataSource.transaction(async (manager) => {
    await usersService.create(UserDto, dto, { manager });
    await ordersService.create(OrderDto, orderDto, { manager });
});
// Both mutations share the same transaction — if one fails, both roll back.
// DtoRepository(repo) in each service uses the manager-bound repo automatically.
```

## Seed (`src/database/seeds/seed.ts`)
Run standalone via `npm run seed`. Idempotent — skips if root user already exists.
Controlled by env vars: `SEED_ROOT_EMAIL`, `SEED_ROOT_PASSWORD`.
Adapt the seed if the users table has different fields.
