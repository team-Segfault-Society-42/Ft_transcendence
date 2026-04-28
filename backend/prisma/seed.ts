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

// ── Define Simulated Games Outcome ──────────────────────────────────────────
const GAMES = [
  { p1: 0, p2: 1, s1: 1, s2: 0, winner: 0,    endReason: 'win'     },
  { p1: 2, p2: 3, s1: 0, s2: 1, winner: 3,    endReason: 'win'     },
  { p1: 4, p2: 5, s1: 0, s2: 0, winner: null, endReason: 'draw'    },
  { p1: 6, p2: 7, s1: 0, s2: 1, winner: 7,    endReason: 'win'     },
  { p1: 8, p2: 9, s1: 1, s2: 0, winner: 8,    endReason: 'win'     },
  { p1: 0, p2: 3, s1: 0, s2: 1, winner: 3,    endReason: 'win'     },
  { p1: 1, p2: 4, s1: 1, s2: 0, winner: 1,    endReason: 'win'     },
  { p1: 2, p2: 5, s1: 1, s2: 0, winner: 2,    endReason: 'forfeit' },
  { p1: 6, p2: 9, s1: 0, s2: 1, winner: 9,    endReason: 'win'     },
  { p1: 7, p2: 8, s1: 1, s2: 0, winner: 7,    endReason: 'win'     },
  { p1: 0, p2: 5, s1: 0, s2: 1, winner: 5,    endReason: 'win'     },
  { p1: 1, p2: 6, s1: 0, s2: 0, winner: null, endReason: 'draw'    },
  { p1: 3, p2: 8, s1: 1, s2: 0, winner: 3,    endReason: 'win'     },
  { p1: 4, p2: 9, s1: 0, s2: 1, winner: 9,    endReason: 'forfeit' },
  { p1: 2, p2: 7, s1: 1, s2: 0, winner: 2,    endReason: 'win'     },
  { p1: 0, p2: 9, s1: 1, s2: 0, winner: 0,    endReason: 'win'     },
  { p1: 1, p2: 8, s1: 0, s2: 1, winner: 8,    endReason: 'win'     },
  { p1: 5, p2: 6, s1: 1, s2: 0, winner: 5,    endReason: 'win'     },
  { p1: 3, p2: 7, s1: 0, s2: 0, winner: null, endReason: 'draw'    },
  { p1: 4, p2: 8, s1: 0, s2: 1, winner: 8,    endReason: 'win'     },
];

// ── Seed Database ───────────────────────────────────────────────────────────
async function main() {

  // ── Update or Create Users ───────────────────────────────────────────
  console.log(`\x1b[36m>>> Seeding Dummy Users`)

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
  process.stdout.write(`\r\x1b[32m✓ Seeded dummy ${n + 1}/${DUMMY_COUNT}\x1b[0m`);
}
  console.log(``);

  // ── Fetch all users in ascending order ──────────────────────────
  const users = await prisma.user.findMany({
    where: { username: { in: Array.from({ length: DUMMY_COUNT}, (_, n) => `dummy${n}`) } },
    orderBy: { username: 'asc' },
  });

  // ── Wipe any existing games ─────────────────────────────────────
  await prisma.game.deleteMany({
    where: { OR: [
      { player1: { username: { startsWith: 'dummy' } } },
      { player2: { username: { startsWith: 'dummy' } } },
    ]},
  });
  console.log('\x1b[32m✓ Deleted any existing games');

  // ── Add Games to Database ───────────────────────────────────────
  for (const {p1, p2, winner, endReason, s1, s2} of GAMES) {
    await prisma.game.create({
      data: {
        player1Id: users[p1].id,
        player2Id: users[p2].id,
        winnerId: winner !== null ? users[winner].id : null,
        endReason: endReason,
        scoresP1: s1,
        scoresP2: s2,
      },
    });
  }
  console.log('\x1b[32m✓ Added Games to Database')

  // ── Calculate Stats and XP for users ────────────────────────────
  for (const user of users) {
    // ── Get Total Games ───────────────────────
    const wins = await prisma.game.count({ where: { winnerId: user.id } });
    const draws = await prisma.game.count({
      where: { OR: [{ player1Id: user.id }, { player2Id: user.id }], endReason: 'draw' },
    });
    const total = await prisma.game.count({
      where: { OR: [{ player1Id: user.id }, { player2Id: user.id }] },
    });
    const losses = total - wins - draws;

    // ── XP & Update User ──────────────────────
    const xp = wins * 20 + draws * 10 + losses * 5;
    await prisma.user.update({ where: { id: user.id }, data: { wins, losses, draws, xp } });
  }
  console.log('\x1b[32m✓ Updated Users\' XP and Stats\x1b[0m');
}


main()
  .then(() => {
    console.log("\x1b[36m>>> Seeding successful!\x1b[0m");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
