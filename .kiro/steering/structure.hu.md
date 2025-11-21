# Projekt Struktúra

## Könyvtár Szervezés

```
src/
├── index.ts              # Alkalmazás belépési pont, Elysia szerver beállítás
├── lib/                  # Alap könyvtári kód
│   └── api.class.ts      # Api osztály kérés/válasz kezeléshez
└── endpoints/            # API végpont kezelők
    └── {név}.{metódus}.ts
```

## Architektúra Minták

### Fájl-alapú Routing

A végpontok név és HTTP metódus szerint vannak szervezve:

- Minta: `src/endpoints/{id}.{metódus}.ts`
- Példa: `teszt.get.ts`, `teszt.post.ts`
- Minden végpont egy default függvényt exportál, amely paramétereket fogad és eredmény objektumot ad vissza

### Végpont Struktúra

```typescript
export default (params: Record<string, any>) => {
	return {
		// Válasz adatok
	};
};
```

### Kérés Folyamat

1. Minden kérés a `/:id` catch-all route-ra érkezik az `index.ts`-ben
2. Az `Api` osztály kinyeri a kontextust (params, query, body, headers)
3. A végpont dinamikusan betöltődik a `src/endpoints/{id}.{metódus}.ts` fájlból
4. A válasz formázva van `statusCode`, `result` és `errors` mezőkkel

### Api Osztály Felelősségek

- Kérés kontextus feldolgozása (method, params, query, body, headers)
- Végpont modulok dinamikus betöltése
- Hibakezelés (404 hiányzó végpontokhoz)
- Konzisztens JSON válaszok formázása
