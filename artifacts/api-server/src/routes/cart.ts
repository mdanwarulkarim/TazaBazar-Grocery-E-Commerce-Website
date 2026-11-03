import { Router } from "express";
import { db, cartItemsTable, productsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

function getSessionId(req: any): string {
  let sessionId = req.cookies?.session_id;
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }
  return sessionId;
}

async function buildCartResponse(sessionId: string) {
  const rows = await db
    .select({
      id: cartItemsTable.id,
      productId: cartItemsTable.productId,
      quantity: cartItemsTable.quantity,
      name: productsTable.name,
      price: productsTable.price,
      unit: productsTable.unit,
      imageUrl: productsTable.imageUrl,
    })
    .from(cartItemsTable)
    .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .where(eq(cartItemsTable.sessionId, sessionId));

  const items = rows.map((r) => ({
    id: r.id,
    productId: r.productId,
    name: r.name ?? "",
    price: parseFloat(r.price ?? "0"),
    quantity: r.quantity,
    unit: r.unit ?? "",
    imageUrl: r.imageUrl ?? "",
  }));

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return { items, totalItems, totalPrice: parseFloat(totalPrice.toFixed(2)) };
}

router.get("/cart", async (req, res) => {
  try {
    const sessionId = getSessionId(req);
    res.cookie("session_id", sessionId, { httpOnly: true, sameSite: "lax" });
    res.json(await buildCartResponse(sessionId));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

router.post("/cart", async (req, res) => {
  try {
    const sessionId = getSessionId(req);
    res.cookie("session_id", sessionId, { httpOnly: true, sameSite: "lax" });

    const { productId, quantity } = req.body as { productId: number; quantity: number };
    if (!productId || !quantity || quantity < 1) {
      res.status(400).json({ error: "Invalid productId or quantity" });
      return;
    }

    const existing = await db
      .select()
      .from(cartItemsTable)
      .where(and(eq(cartItemsTable.sessionId, sessionId), eq(cartItemsTable.productId, productId)))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(cartItemsTable)
        .set({ quantity: existing[0].quantity + quantity })
        .where(eq(cartItemsTable.id, existing[0].id));
    } else {
      await db.insert(cartItemsTable).values({ sessionId, productId, quantity });
    }

    res.json(await buildCartResponse(sessionId));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to add to cart" });
  }
});

router.patch("/cart/:itemId", async (req, res) => {
  try {
    const sessionId = getSessionId(req);
    res.cookie("session_id", sessionId, { httpOnly: true, sameSite: "lax" });

    const itemId = parseInt(req.params.itemId);
    const { quantity } = req.body as { quantity: number };

    if (isNaN(itemId) || !quantity || quantity < 1) {
      res.status(400).json({ error: "Invalid itemId or quantity" });
      return;
    }

    await db
      .update(cartItemsTable)
      .set({ quantity })
      .where(and(eq(cartItemsTable.id, itemId), eq(cartItemsTable.sessionId, sessionId)));

    res.json(await buildCartResponse(sessionId));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update cart item" });
  }
});

router.delete("/cart/clear", async (req, res) => {
  try {
    const sessionId = getSessionId(req);
    await db.delete(cartItemsTable).where(eq(cartItemsTable.sessionId, sessionId));
    res.json({ items: [], totalItems: 0, totalPrice: 0 });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to clear cart" });
  }
});

router.delete("/cart/:itemId", async (req, res) => {
  try {
    const sessionId = getSessionId(req);
    res.cookie("session_id", sessionId, { httpOnly: true, sameSite: "lax" });

    const itemId = parseInt(req.params.itemId);
    if (isNaN(itemId)) {
      res.status(400).json({ error: "Invalid itemId" });
      return;
    }

    await db
      .delete(cartItemsTable)
      .where(and(eq(cartItemsTable.id, itemId), eq(cartItemsTable.sessionId, sessionId)));

    res.json(await buildCartResponse(sessionId));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to remove cart item" });
  }
});

export default router;
