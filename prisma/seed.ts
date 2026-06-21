import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Yönetici kullanıcı
  const email = process.env.ADMIN_EMAIL ?? "onderkya35@gmail.com";
  const password = process.env.ADMIN_PASSWORD ?? "changeme123";
  const hash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, password: hash, name: "Admin", role: "ADMIN" },
  });
  console.log(`✓ Admin user ready: ${email}`);

  // Ders tipleri
  const lessons = [
    { minutes: 15, order: 0 },
    { minutes: 30, order: 1 },
    { minutes: 60, order: 2 },
  ];
  for (const l of lessons) {
    const existing = await prisma.lessonType.findFirst({ where: { minutes: l.minutes } });
    if (!existing) await prisma.lessonType.create({ data: l });
  }
  console.log("✓ Lesson types ready");

  // Hizmetler
  for (const [i, slug] of ["antalya", "lessons", "education"].entries()) {
    await prisma.service.upsert({ where: { slug }, update: {}, create: { slug, order: i } });
  }
  console.log("✓ Services ready");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
