# Design Document

## Áttekintés

A Database osztály egy singleton minta implementáció, amely a Bun beépített SQL támogatását használja PostgreSQL adatbázis kapcsolat kezelésére. Az osztály biztosítja, hogy az alkalmazás életciklusa során csak egyetlen adatbázis kapcsolat jöjjön létre, és típusbiztos interfészt nyújt tárolt eljárások futtatásához.

## Architektúra

### Singleton Minta

A Database osztály a klasszikus singleton mintát követi:

- Privát konstruktor megakadályozza a közvetlen példányosítást
- Statikus `getInstance()` metódus biztosítja az egyetlen példány elérését
- Lazy initialization: a kapcsolat csak az első használatkor jön létre

### Kapcsolat Kezelés

A kapcsolat a Bun beépített SQL támogatásán keresztül történik:

```typescript
import { sql } from 'bun';
```

A Bun `sql` függvénye lehetővé teszi a közvetlen SQL kapcsolatot connection string-gel. PostgreSQL esetén a `postgres://` protokollt használjuk.

A kapcsolat paraméterek környezeti változókból származnak:

- `DATABASE_URL`: teljes kapcsolati string (elsődleges)
- Vagy külön változók: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

## Komponensek és Interfészek

### Database Osztály

```typescript
class Database {
	private static instance: Database | null = null;
	private connection: any | null = null;

	private constructor() {}

	public static getInstance(): Database;
	public async connect(): Promise<void>;
	public async callProcedure<T>(procedureName: string, params?: any[]): Promise<T>;
	public async query<T>(sql: string, params?: any[]): Promise<T>;
	public async disconnect(): Promise<void>;
}
```

### Típus Definíciók

```typescript
// Tárolt eljárás eredmény típusok
type ProcedureResult<T> = T extends Array<infer U> ? U[] : T;

// Kapcsolat konfiguráció
interface DatabaseConfig {
	host?: string;
	port?: number;
	database?: string;
	username?: string;
	password?: string;
	url?: string;
}
```

## Adatmodellek

### Környezeti Változók

```
DATABASE_URL=postgres://user:password@localhost:5432/dbname
# vagy
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dbname
DB_USER=user
DB_PASSWORD=password
```

### Tárolt Eljárás Hívás Példák

```typescript
// Lista visszaadása
interface User {
	id: number;
	name: string;
	email: string;
}

const users = await db.callProcedure<User[]>('get_all_users', []);

// Egyedi érték visszaadása
interface UserCount {
	count: number;
}

const result = await db.callProcedure<UserCount>('count_users', []);

// Paraméterekkel
const user = await db.callProcedure<User>('get_user_by_id', [123]);
```

## Correctness Properties

_A property egy olyan jellemző vagy viselkedés, amely igaznak kell lennie a rendszer minden érvényes végrehajtása során - lényegében egy formális állítás arról, hogy mit kell tennie a rendszernek. A property-k hídként szolgálnak az ember által olvasható specifikációk és a géppel ellenőrizhető helyességi garanciák között._

### Property 1: Singleton invariancia

_Bármely_ két getInstance() hívás esetén, a visszaadott példányok referenciája azonos kell legyen, és a belső kapcsolat objektum is ugyanaz marad.
**Validates: Requirements 1.1, 1.4**

### Property 2: Paraméter átadás helyessége

_Bármely_ tárolt eljárás hívás esetén, a megadott paraméterek pontosan ugyanabban a sorrendben és értékkel kerülnek átadásra az adatbázisnak, ahogy a hívó megadta őket.
**Validates: Requirements 2.1**

### Property 3: Hibakezelés konzisztenciája

_Bármely_ sikertelen tárolt eljárás hívás esetén, a rendszer kivételt dob, amely tartalmazza az eredeti hiba információit.
**Validates: Requirements 2.5**

### Property 4: SQL injection védelem

_Bármely_ paraméter érték esetén (beleértve a speciális SQL karaktereket is), a rendszer paraméteres lekérdezést használ, és soha nem fűz össze stringeket SQL parancsok létrehozásához.
**Validates: Requirements 4.1, 4.3**

## Hibakezelés

### Kapcsolódási Hibák

- **Hiányzó környezeti változók**: `DatabaseConfigError` kivétel értelmes hibaüzenettel
- **Sikertelen kapcsolódás**: `DatabaseConnectionError` kivétel a postgres modul hibájával
- **Időtúllépés**: Kapcsolódási timeout beállítása (pl. 10 másodperc)

### Tárolt Eljárás Hibák

- **Nem létező eljárás**: A postgres modul hibája továbbítódik
- **Hibás paraméterek**: A postgres modul hibája továbbítódik
- **Futási hibák**: A postgres modul hibája továbbítódik

### Egyedi Hibaosztályok

```typescript
class DatabaseError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'DatabaseError';
	}
}

class DatabaseConfigError extends DatabaseError {
	constructor(message: string) {
		super(message);
		this.name = 'DatabaseConfigError';
	}
}

class DatabaseConnectionError extends DatabaseError {
	constructor(
		message: string,
		public originalError?: Error
	) {
		super(message);
		this.name = 'DatabaseConnectionError';
	}
}
```

## Tesztelési Stratégia

### Unit Tesztek

A unit tesztek konkrét példákat és edge case-eket fednek le:

1. **Singleton viselkedés példák**:
   - getInstance() többszöri hívása ugyanazt a példányt adja vissza
   - Környezeti változók beolvasása DATABASE_URL-ből
   - Környezeti változók beolvasása külön változókból

2. **Edge case-ek**:
   - Hiányzó környezeti változók kezelése
   - Sikertelen kapcsolódás kezelése
   - Speciális karakterek a paraméterekben

### Property-Based Tesztek

A property-based tesztek univerzális tulajdonságokat ellenőriznek sok véletlenszerű bemenet esetén:

**Használt könyvtár**: `fast-check` (TypeScript/JavaScript property-based testing library)

**Konfiguráció**: Minden property teszt minimum 100 iterációt futtat.

**Property tesztek**:

1. **Property 1: Singleton invariancia**
   - Generálunk N darab getInstance() hívást
   - Ellenőrizzük, hogy minden hívás ugyanazt a referenciát adja vissza
   - **Feature: postgres-database-singleton, Property 1: Singleton invariancia**

2. **Property 2: Paraméter átadás helyessége**
   - Generálunk véletlenszerű paraméter tömböket (számok, stringek, null értékek)
   - Hívunk egy mock tárolt eljárást
   - Ellenőrizzük, hogy a paraméterek változatlanul átadásra kerültek
   - **Feature: postgres-database-singleton, Property 2: Paraméter átadás helyessége**

3. **Property 3: Hibakezelés konzisztenciája**
   - Generálunk véletlenszerű hibás tárolt eljárás hívásokat
   - Ellenőrizzük, hogy minden esetben kivétel dobódik
   - **Feature: postgres-database-singleton, Property 3: Hibakezelés konzisztenciája**

4. **Property 4: SQL injection védelem**
   - Generálunk véletlenszerű stringeket SQL speciális karakterekkel (', ", --, ;, stb.)
   - Hívunk tárolt eljárást ezekkel a paraméterekkel
   - Ellenőrizzük, hogy a hívás biztonságosan végrehajtódik paraméteres lekérdezéssel
   - **Feature: postgres-database-singleton, Property 4: SQL injection védelem**

**Megjegyzés**: A property tesztek és unit tesztek kiegészítik egymást. A unit tesztek konkrét bugokat fognak el, míg a property tesztek az általános helyességet ellenőrzik.

## Implementációs Részletek

### Bun SQL Használata

A Bun beépített `sql` függvénye lehetővé teszi a közvetlen adatbázis kapcsolatot:

```typescript
import { sql } from 'bun';

// Kapcsolódás PostgreSQL-hez
const connection = sql({
	url: process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/dbname'
});
```

A Bun `sql` függvénye támogatja:

- PostgreSQL (`postgres://`)
- MySQL (`mysql://`)
- SQLite (`sqlite://`)

### Tárolt Eljárás Hívás

```typescript
// Példa tárolt eljárás hívásra tagged template literal szintaxissal
const result = await connection`SELECT * FROM my_procedure(${param1}, ${param2})`;

// Vagy query metódussal
const result = await connection.query('SELECT * FROM my_procedure($1, $2)', [param1, param2]);
```

A Bun SQL automatikusan kezeli:

- Paraméterek escape-elését
- Típus konverziót
- Connection pooling-ot
- Prepared statements-eket

### Típusbiztonság

TypeScript generikus típusok biztosítják a típusbiztonságot:

```typescript
async callProcedure<T>(procedureName: string, params: any[] = []): Promise<T> {
  // A T típus paraméter határozza meg a visszatérési típust
  // Paraméterek helyőrzőinek generálása ($1, $2, ...)
  const placeholders = params.map((_, i) => `$${i + 1}`).join(', ');
  const query = `SELECT * FROM ${procedureName}(${placeholders})`;
  const result = await this.connection.query(query, params);
  return result as T;
}
```

## Teljesítmény Megfontolások

- **Connection Pooling**: A Bun SQL automatikusan kezeli a connection pool-t
- **Lazy Initialization**: A kapcsolat csak az első használatkor jön létre
- **Singleton**: Elkerüli a felesleges kapcsolatok létrehozását
- **Prepared Statements**: A Bun SQL automatikusan használ prepared statement-eket
- **Natív Teljesítmény**: A Bun beépített SQL támogatása natív teljesítményt nyújt

## Biztonsági Megfontolások

- **Környezeti változók**: Érzékeny adatok (jelszavak) környezeti változókban tárolódnak
- **Paraméteres lekérdezések**: SQL injection védelem
- **Kapcsolat timeout**: Megakadályozza a végtelen várakozást
- **Hibakezelés**: Érzékeny információk nem kerülnek a hibaüzenetekbe
