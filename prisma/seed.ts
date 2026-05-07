import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed a test user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      username: 'testuser',
      passwordHash: '$2b$10$placeholder_hash',
    },
  });

  // Seed a test event
  const event = await prisma.event.upsert({
    where: { id: 'seed-event-1' },
    update: {},
    create: {
      id: 'seed-event-1',
      name: 'Melbourne Cup 2026',
      description: 'The race that stops a nation',
      startTime: new Date('2026-11-03T03:00:00Z'),
      status: 'UPCOMING',
    },
  });

  // Seed a test race
  const race = await prisma.race.upsert({
    where: { id: 'seed-race-1' },
    update: {},
    create: {
      id: 'seed-race-1',
      name: 'Race 1',
      number: 1,
      distance: 3200,
      status: 'UPCOMING',
      startTime: new Date('2026-11-03T03:00:00Z'),
      eventId: event.id,
    },
  });

  // Seed test runners
  const runner1 = await prisma.runner.upsert({
    where: { id: 'seed-runner-1' },
    update: {},
    create: {
      id: 'seed-runner-1',
      name: 'Winx',
      number: 1,
      barrier: 3,
      jockey: 'Hugh Bowman',
      trainer: 'Chris Waller',
      weight: 57.5,
      raceId: race.id,
    },
  });

  const runner2 = await prisma.runner.upsert({
    where: { id: 'seed-runner-2' },
    update: {},
    create: {
      id: 'seed-runner-2',
      name: 'Black Caviar',
      number: 2,
      barrier: 7,
      jockey: 'Luke Nolen',
      trainer: 'Peter Moody',
      weight: 56.0,
      raceId: race.id,
    },
  });

  // Seed odds lines
  await prisma.oddsLine.createMany({
    skipDuplicates: true,
    data: [
      { id: 'seed-odds-1', odds: 2.5, bookmaker: 'TAB', raceId: race.id, runnerId: runner1.id },
      { id: 'seed-odds-2', odds: 4.0, bookmaker: 'TAB', raceId: race.id, runnerId: runner2.id },
    ],
  });

  console.log('Seed data created:', { user, event, race, runner1, runner2 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
