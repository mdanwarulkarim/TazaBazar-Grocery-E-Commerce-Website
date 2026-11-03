import { Router } from "express";
import { db, ordersTable, orderItemsTable, cartItemsTable, productsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

function getSessionId(req: any): string {
  return req.cookies?.session_id ?? "";
}

async function buildOrderWithItems(orderId: number) {
  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, orderId))
    .limit(1);

  if (!order) return null;

  const items = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, orderId));

  return {
    id: order.id,
    status: order.status,
    totalPrice: parseFloat(order.totalPrice),
    deliveryAddress: order.deliveryAddress,
    phone: order.phone,
    note: order.note,
    createdAt: order.createdAt.toISOString(),
    items: items.map((i) => ({
      id: i.id,
      productId: i.productId,
      name: i.name,
      price: parseFloat(i.price),
      quantity: i.quantity,
      unit: i.unit,
    })),
  };
}

router.get("/orders", async (req, res) => {
  try {
    const sessionId = getSessionId(req);
    const userId = (req as any).userId;

    const condition = userId
      ? eq(ordersTable.userId, userId)
      : eq(ordersTable.sessionId, sessionId);

    const orders = await db.select().from(ordersTable).where(condition).orderBy(ordersTable.createdAt);

    const result = await Promise.all(orders.map((o) => buildOrderWithItems(o.id)));
    res.json(result.filter(Boolean));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

router.post("/orders", async (req, res) => {
  try {
    const sessionId = getSessionId(req);
    const { deliveryAddress, phone, note } = req.body as {
      deliveryAddress: string;
      phone: string;
      note?: string;
    };

    if (!deliveryAddress || !phone) {
      res.status(400).json({ error: "deliveryAddress and phone are required" });
      return;
    }

    const cartRows = await db
      .select({
        id: cartItemsTable.id,
        productId: cartItemsTable.productId,
        quantity: cartItemsTable.quantity,
        name: productsTable.name,
        price: productsTable.price,
        unit: productsTable.unit,
      })
      .from(cartItemsTable)
      .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
      .where(eq(cartItemsTable.sessionId, sessionId));

    if (cartRows.length === 0) {
      res.status(400).json({ error: "Cart is empty" });
      return;
    }

    const totalPrice = cartRows.reduce(
      (sum, i) => sum + parseFloat(i.price ?? "0") * i.quantity,
      0,
    );

    const [order] = await db
      .insert(ordersTable)
      .values({
        sessionId,
        status: "pending",
        totalPrice: totalPrice.toFixed(2),
        deliveryAddress,
        phone,
        note: note ?? null,
      })
      .returning();

    await db.insert(orderItemsTable).values(
      cartRows.map((i) => ({
        orderId: order.id,
        productId: i.productId,
        name: i.name ?? "",
        price: i.price ?? "0",
        quantity: i.quantity,
        unit: i.unit ?? "",
      })),
    );

    await db.delete(cartItemsTable).where(eq(cartItemsTable.sessionId, sessionId));

    res.status(201).json(await buildOrderWithItems(order.id));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

router.get("/orders/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const order = await buildOrderWithItems(id);
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.json(order);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

export default router;
