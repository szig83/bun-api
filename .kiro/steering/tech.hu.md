# Technológiai Stack

## Futtatókörnyezet és Build Rendszer

- **Futtatókörnyezet**: Bun (v1.3.2+)
- **Csomagkezelő**: Bun (használj `bun` parancsokat, NE npm/yarn/pnpm/node-ot)
- **Nyelv**: TypeScript strict móddal

## Keretrendszerek és Könyvtárak

- **Web Keretrendszer**: Elysia v1.4.16
- **Kódformázás**: Prettier v3.6.2

## Gyakori Parancsok

```bash
# Függőségek telepítése
bun install

# Fejlesztés (automatikus újratöltéssel)
bun run dev

# Production build készítése
bun run build

# Production build futtatása
bun run start

# Tesztek futtatása
bun run test
```

## TypeScript Konfiguráció

- Target: ESNext bundler modul feloldással
- Strict mód engedélyezve további biztonsági ellenőrzésekkel
- No emit mód (Bun kezeli a transpilálást)
- Lehetővé teszi a `.ts` kiterjesztések közvetlen importálását
