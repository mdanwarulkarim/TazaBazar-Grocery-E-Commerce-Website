import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const router = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "tazabazar_salt").digest("hex");
}

router.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body as {
      name: string;
      email: string;
      password: string;
      phone?: string;
    };

    if (!name || !email || !password) {
      res.status(400).json({ error: "name, email, and password are required" });
      return;
    }

    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }

    const [user] = await db
      .insert(usersTable)
      .values({ name, email, password: hashPassword(password), phone: phone ?? null })
      .returning({ id: usersTable.id, name: usersTable.name, email: usersTable.email, phone: usersTable.phone });

    (req.session as any).userId = user.id;

    res.status(201).json({ user });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to register" });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      res.status(400).json({ error: "email and password are required" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);

    if (!user || user.password !== hashPassword(password)) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    (req.session as any).userId = user.id;

    res.json({
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to login" });
  }
});

router.post("/auth/logout", async (req, res) => {
  try {
    req.session?.destroy?.(() => {});
    res.json({ message: "Logged out" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to logout" });
  }
});

router.get("/auth/me", async (req, res) => {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const [user] = await db
      .select({ id: usersTable.id, name: usersTable.name, email: usersTable.email, phone: usersTable.phone })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    res.json(user);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

export default router;
