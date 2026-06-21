import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const WEAK = new Set(["changeme123", "password", "admin", "12345678", "changeme"]);

async function main() {
  // Yönetici kullanıcı — güçlü şifre ZORUNLU (varsayılan/zayıf şifre reddedilir).
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("ADMIN_EMAIL ve ADMIN_PASSWORD ortam değişkenleri gereklidir.");
  }
  if (password.length < 12 || WEAK.has(password.toLowerCase())) {
    throw new Error(
      "ADMIN_PASSWORD en az 12 karakter ve tahmin edilemez olmalı (zayıf/varsayılan şifre reddedildi)."
    );
  }
  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 24) {
    throw new Error("AUTH_SECRET ayarlanmalı (öneri: openssl rand -base64 32).");
  }
  const hash = await bcrypt.hash(password, 12);

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
