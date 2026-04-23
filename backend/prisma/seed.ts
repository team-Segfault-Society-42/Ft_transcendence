import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'node:fs';


// ── Define Prisma Client ────────────────────────────────────────────────────
const connectionString = fs.readFileSync('/run/secrets/database_url', 'utf8').trim();
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });


// ── Define Constants ────────────────────────────────────────────────────────
const DUMMY_COUNT = 10;
const PASSWORD = 'Dummy123';
const AVATARS = Array.from(
  { length: DUMMY_COUNT },
  (_, n) => `https://api.dicebear.com/9.x/pixel-art/svg?seed=dummy${n}`
);


// ── Seed Database ───────────────────────────────────────────────────────────
async function main() {

  // ── Seed Achievements ────────────────────────────────────────────────
  const firstWin = await prisma.achievement.upsert({
    where: { key: 'FIRST_WIN' },
    update: {
      displayName: 'First Blood',
      description: 'Win your first game.',
    },
    create: {
      key: 'FIRST_WIN',
      displayName: 'First Blood',
      description: 'Win your first game.',
    },
  });
  const firstGame = await prisma.achievement.upsert({
    where: { key: 'FIRST_GAME' },
    update: {
      displayName: 'First of all',
      description: 'Play your first game.',
    },
    create: {
      key: 'FIRST_GAME',
      displayName: 'First of all',
      description: 'Play your first game.',
    },
  });
  const drawGame = await prisma.achievement.upsert({
    where: { key: 'DRAW_GAME' },
    update: {
      displayName: 'Boring',
      description: 'Draw a game.',
    },
    create: {
      key: 'DRAW_GAME',
      displayName: 'Boring',
      description: 'Draw a game.',
    },
  });
    const looseByTime = await prisma.achievement.upsert({
    where: { key: 'LOSE_BY_TIME' },
    update: {
      displayName: 'Noob',
      description: 'Lose a game by time.',
    },
    create: {
      key: 'LOSE_BY_TIME',
      displayName: 'Noob',
      description: 'Lose a game by time.',
    },
  });

	// ── Update or Create Users ───────────────────────────────────────────
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  for (let n = 0; n < DUMMY_COUNT; n++) {
    await prisma.user.upsert({
      where: { email: `dummy${n}@mail.com` },
      update: {},
      create: {
        email: `dummy${n}@mail.com`,
        username: `dummy${n}`,
        passwordHash,
        avatar: AVATARS[n],
      },
    });
    console.log(`Seeded dummy${n}`);
  }
}


main()
  .then(() => {
    console.log("✅ Seeding terminé avec succès !");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
