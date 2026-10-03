// prisma/seed.ts
import { db } from "./db"; // adjust to wherever your generated `db` lives

async function main() {
  // Reserve id 0 as the default "system" user until real auth exists.
  const existing = await db.orm.public.User.where({ id: 0 }).first();

  if (!existing) {
    await db.orm.public.User.create({
      id: 0,
      email: "system@local",
      name: "Default user",
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.runtime().close());