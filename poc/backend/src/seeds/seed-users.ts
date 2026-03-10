import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity';
import { getSeedDataSourceConfig } from '../config/database.config';

const SEED_USERS = [
  { name: 'Admin User', email: 'admin@barangay.ph', role: 'admin' as const },
  { name: 'Citizen User', email: 'citizen@barangay.ph', role: 'citizen' as const },
];

const DEFAULT_PASSWORD = 'barangay2026';

async function seed() {
  const dataSource = new DataSource(getSeedDataSourceConfig());

  await dataSource.initialize();
  console.log('Database connected for seeding...');

  const userRepo = dataSource.getRepository(User);
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  for (const seedUser of SEED_USERS) {
    const existing = await userRepo.findOne({ where: { email: seedUser.email } });
    if (existing) {
      console.log(`  ⏭  Skipped (already exists): ${seedUser.name} <${seedUser.email}>`);
      continue;
    }

    const user = userRepo.create({
      name: seedUser.name,
      email: seedUser.email,
      password: hashedPassword,
      role: seedUser.role,
    });
    await userRepo.save(user);
    console.log(`  ✅ Created: ${seedUser.name} <${seedUser.email}>`);
  }


  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
