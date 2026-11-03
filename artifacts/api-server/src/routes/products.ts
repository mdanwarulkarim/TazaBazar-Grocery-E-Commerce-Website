import { Router } from "express";
import { db, productsTable, categoriesTable } from "@workspace/db";
import { eq, ilike, and } from "drizzle-orm";

const router = Router();

function getDynamicPrice(basePrice: number, productId: number): number {
  const now = new Date();
  const timeSlot = Math.floor(now.getHours() / 2);
  const seed = ((productId * 31) + (timeSlot * 17)) % 100;
  const factor = 0.93 + (seed / 100) * 0.14;
  return Math.round(basePrice * factor * 100) / 100;
}

function getPriceChange(base: number, dynamic: number): "up" | "down" | "same" {
  if (dynamic > base * 1.01) return "up";
  if (dynamic < base * 0.99) return "down";
  return "same";
}

function formatProduct(row: {
  id: number;
  name: string;
  nameBn: string | null;
  subcategory: string | null;
  price: string;
  originalPrice: string | null;
  categoryId: number;
  categoryName: string | null;
  categorySlug: string | null;
  unit: string;
  imageUrl: string;
  inStock: boolean;
  isPopular: boolean;
  isOnSale: boolean;
  description: string | null;
}) {
  const basePrice = parseFloat(row.price);
  const dynamicPrice = getDynamicPrice(basePrice, row.id);
  const baseOriginal = row.originalPrice ? parseFloat(row.originalPrice) : null;
  const priceChange = getPriceChange(basePrice, dynamicPrice);
  let displayOriginal = baseOriginal;
  if (!row.isOnSale && priceChange === "up") displayOriginal = basePrice;

  return {
    id: row.id,
    name: row.name,
    nameBn: row.nameBn ?? row.name,
    subcategory: row.subcategory,
    price: dynamicPrice,
    originalPrice: displayOriginal,
    basePrice,
    priceChange,
    categoryId: row.categoryId,
    categoryName: row.categoryName ?? "",
    categorySlug: row.categorySlug ?? "",
    unit: row.unit,
    imageUrl: row.imageUrl,
    inStock: row.inStock,
    isPopular: row.isPopular,
    isOnSale: row.isOnSale || priceChange === "down",
    description: row.description,
  };
}

const productFields = {
  id: productsTable.id,
  name: productsTable.name,
  nameBn: productsTable.nameBn,
  subcategory: productsTable.subcategory,
  price: productsTable.price,
  originalPrice: productsTable.originalPrice,
  categoryId: productsTable.categoryId,
  categoryName: categoriesTable.name,
  categorySlug: categoriesTable.slug,
  unit: productsTable.unit,
  imageUrl: productsTable.imageUrl,
  inStock: productsTable.inStock,
  isPopular: productsTable.isPopular,
  isOnSale: productsTable.isOnSale,
  description: productsTable.description,
};

router.get("/products", async (req, res) => {
  try {
    const { category, q, subcategory, limit = "24", offset = "0" } = req.query as Record<string, string>;
    const conditions = [];
    if (category) {
      const cat = await db.select({ id: categoriesTable.id }).from(categoriesTable).where(eq(categoriesTable.slug, category)).limit(1);
      if (cat.length > 0) conditions.push(eq(productsTable.categoryId, cat[0].id));
    }
    if (q) conditions.push(ilike(productsTable.name, `%${q}%`));
    if (subcategory) conditions.push(eq(productsTable.subcategory, subcategory));

    const rows = await db.select(productFields).from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(parseInt(limit)).offset(parseInt(offset));

    res.json(rows.map(formatProduct));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.get("/products/popular", async (req, res) => {
  try {
    const rows = await db.select(productFields).from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(eq(productsTable.isPopular, true)).limit(12);
    res.json(rows.map(formatProduct));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch popular products" });
  }
});

router.get("/products/deals", async (req, res) => {
  try {
    const rows = await db.select(productFields).from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(eq(productsTable.isOnSale, true)).limit(12);
    res.json(rows.map(formatProduct));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch deals" });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const rows = await db.select(productFields).from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(eq(productsTable.id, id)).limit(1);
    if (rows.length === 0) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json(formatProduct(rows[0]));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

export default router;
