// dotenv must load first — this script runs outside NestJS.
import 'dotenv/config';

import { AppDataSource } from '../config/data-source';
import { User } from 'src/modules/user-management/users/entities/user.entity';
import { hashPassword } from 'src/shared/utils/crypto.util';

const GREEN  = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED    = '\x1b[31m';
const CYAN   = '\x1b[36m';
const RESET  = '\x1b[0m';
const BOLD   = '\x1b[1m';

/**
 * Inserts the root user if it does not already exist.
 * Idempotent — safe to run multiple times.
 * Uses the TypeORM repository API so it works with any supported database driver.
 */
async function seedRootUser(): Promise<void> {
    const email            = process.env.SEED_ROOT_EMAIL            ?? 'root@app.com';
    const password         = process.env.SEED_ROOT_PASSWORD         ?? 'Root1234!';
    const ci               = process.env.SEED_ROOT_CI               ?? '00000000';
    const fullname         = process.env.SEED_ROOT_FULLNAME         ?? 'Root';
    const paternalSurname  = process.env.SEED_ROOT_PATERNAL_SURNAME ?? 'Admin';
    const maternalSurname  = process.env.SEED_ROOT_MATERNAL_SURNAME ?? 'Sistema';

    const repo = AppDataSource.getRepository(User);

    const existing = await repo.findOne({ where: { email } });

    if (existing) {
        console.log(`  ${YELLOW}⚠  Root user already exists${RESET} (${email}) — skipping.`);
        return;
    }

    const hashed = await hashPassword(password);

    // roleId = 1 is the root role created by the initial migration.
    const user = repo.create({ email, password: hashed, roleId: 1, ci, fullname, paternalSurname, maternalSurname });
    await repo.save(user);

    console.log(`  ${GREEN}✔  Root user created${RESET} → ${BOLD}${email}${RESET}`);
    console.log(`  ${YELLOW}⚠  Change the root password in production.${RESET}`);
}

async function seed(): Promise<void> {
    console.log(`\n${CYAN}${BOLD}▶  Running seed...${RESET}\n`);

    await AppDataSource.initialize();
    console.log(`  ${GREEN}✔  Database connection established${RESET}`);

    try {
        await seedRootUser();
        // Add more seeders here in dependency order.

        console.log(`\n${GREEN}${BOLD}✔  Seed completed.${RESET}\n`);
    } catch (error) {
        console.error(`\n${RED}${BOLD}✘  Seed failed:${RESET}`, error);
        process.exit(1);
    } finally {
        await AppDataSource.destroy();
    }
}

seed();
