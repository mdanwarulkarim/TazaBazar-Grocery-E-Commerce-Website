# TazaBazar

A Chaldal-inspired online grocery delivery website for urban shoppers. "Taza" means fresh in Bengali.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/tazabazar run dev` — run the frontend (port 25427)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — session secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS (artifacts/tazabazar)
- API: Express 5 (artifacts/api-server)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (zod/v4), drizzle-zod
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contracts)
- `lib/db/src/schema/` — DB schema (users, categories, products, cart, orders)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/tazabazar/src/pages/` — React pages (Home, Category, Search, Product, Cart, Checkout, Orders, Login, Register)
- `artifacts/tazabazar/src/context/` — CartContext, AuthContext
- `artifacts/tazabazar/src/components/` — Header, ProductCard

## Product

TazaBazar is a grocery delivery website with:
- **Home** — Hero banner, 8 categories, Flash Deals, Popular products
- **Category pages** — Browse products with sidebar navigation
- **Search** — Real-time product search
- **Product detail** — Full product view with add-to-cart
- **Cart** — Item management with quantity controls
- **Checkout** — Delivery address and phone, order placement
- **Orders** — Order history and detailed order view with status tracking
- **Auth** — Login and Register pages with session-based auth

## Categories (8)
Food & Beverages, Dairy & Eggs, Snacks & Confectionery, Cleaning Supplies, Personal Care, Baby Care, Health & Wellness, Flash Sales

## Architecture decisions

- Cart is session-based (cookie) so guests can shop without registering
- Product prices stored as numeric in DB, serialized as float in API
- Popular products flagged via `is_popular` boolean on products table
- Deals flagged via `is_on_sale` boolean + `original_price` column
- Auth uses SHA-256 password hashing with a salt + express-session

## User preferences

- JavaScript and Node.js stack preferred
- Inspired by Chaldal.com layout
- No Pet Care, Gadgets, Vehicles, Fashion, Stationery, Toys, or Beauty categories
- Site name: TazaBazar (Taza = fresh in Bengali)

## Gotchas

- Re-run codegen after any OpenAPI spec change: `pnpm --filter @workspace/api-spec run codegen`
- The 401 from /api/auth/me in browser console is expected — it just means no user is logged in
