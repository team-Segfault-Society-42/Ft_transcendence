// import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) 
    throw new Error('DATABASE_URL is not set');

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
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
