# Ocean Coffee - Astro Frontend

This is a modern Astro frontend implementing a coffee ordering flow:
- Browse menu with featured items
- Customize drinks (size, milk, sweetness, temperature, add-ons)
- Persistent cart sidebar with totals
- Checkout with client-side validation and order summary

Tech: Astro islands with minimal global store (no backend calls). Theme: Ocean Professional.

Quick start
- npm install
- npm run dev (served on port 3000 via astro.config.mjs)

Structure
- src/styles/theme.css: Ocean theme variables and utilities
- src/layouts/BaseLayout.astro: Header, footer, and global sidebar slots
- src/components: Header, Footer, CartSidebar, MenuGrid, DrinkCard, Customizer, OrderSummary
- src/lib: menuData.ts, types.ts, store.ts
- pages:
  - / : Home with hero and featured menu
  - /menu : Full menu with customizer modal
  - /checkout : Checkout form with OrderSummary

Notes
- All state is client-side. No .env needed.
- Add images to public/images (optional).
