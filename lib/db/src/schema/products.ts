import { pgTable, text, serial, integer, boolean, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { categoriesTable } from "./categories";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameBn: text("name_bn"),
  subcategory: text("subcategory"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: numeric("original_price", { precision: 10, scale: 2 }),
  categoryId: integer("category_id").notNull().references(() => categoriesTable.id),
  unit: text("unit").notNull().default("1 pc"),
  imageUrl: text("image_url").notNull(),
  inStock: boolean("in_stock").notNull().default(true),
  isPopular: boolean("is_popular").notNull().default(false),
  isOnSale: boolean("is_on_sale").notNull().default(false),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
