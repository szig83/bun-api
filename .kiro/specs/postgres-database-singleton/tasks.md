# Implementációs Terv

- [x] 1. Egyedi hibaosztályok létrehozása
  - Hozd létre a `src/lib/database.errors.ts` fájlt
  - Implementáld a `DatabaseError`, `DatabaseConfigError` és `DatabaseConnectionError` osztályokat
  - _Requirements: 3.3, 3.4_

- [x] 2. Database singleton osztály alapstruktúra
  - [x] 2.1 Hozd létre a `src/lib/database.class.ts` fájlt
    - Implementáld a singleton mintát privát konstruktorral
    - Implementáld a `getInstance()` statikus metódust
    - Adj hozzá privát `connection` property-t
    - _Requirements: 1.1, 1.4_

  - [x] 2.2 Property teszt a singleton invarianciára
    - **Property 1: Singleton invariancia**
    - **Validates: Requirements 1.1, 1.4**

- [x] 3. Környezeti változók kezelése és kapcsolódás
  - [x] 3.1 Implementáld a `connect()` metódust
    - Olvasd be a `DATABASE_URL` környezeti változót
    - Hozz létre kapcsolatot a Bun `sql` függvényével
    - Kezeld a hiányzó környezeti változókat `DatabaseConfigError`-ral
    - Kezeld a sikertelen kapcsolódást `DatabaseConnectionError`-ral
    - _Requirements: 1.2, 3.1, 3.2, 3.3, 3.4_

  - [x] 3.2 Unit tesztek a kapcsolódáshoz
    - Teszt a sikeres kapcsolódásra DATABASE_URL-lel
    - Teszt a hiányzó környezeti változókra
    - Teszt a sikertelen kapcsolódásra
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 4. Tárolt eljárás futtatás implementálása
  - [x] 4.1 Implementáld a `callProcedure<T>()` metódust
    - Generálj paraméter helyőrzőket ($1, $2, ...)
    - Futtasd a tárolt eljárást a `connection.query()` metódussal
    - Kezeld a hibákat és továbbítsd őket
    - Típusos visszatérési érték támogatása generikus típussal
    - _Requirements: 2.1, 2.5_

  - [x] 4.2 Property teszt a paraméter átadás helyességére
    - **Property 2: Paraméter átadás helyessége**
    - **Validates: Requirements 2.1**

  - [x] 4.3 Property teszt a hibakezelés konzisztenciájára
    - **Property 3: Hibakezelés konzisztenciája**
    - **Validates: Requirements 2.5**

- [x] 5. SQL injection védelem
  - [x] 5.1 Ellenőrizd, hogy a `callProcedure` paraméteres lekérdezést használ
    - Soha ne fűzz össze stringeket SQL parancsokhoz
    - Használj mindig paraméter helyőrzőket
    - _Requirements: 4.1, 4.3_

  - [x] 5.2 Property teszt az SQL injection védelemre
    - **Property 4: SQL injection védelem**
    - **Validates: Requirements 4.1, 4.3**

- [x] 6. Query metódus hozzáadása
  - [x] 6.1 Implementáld a `query<T>()` metódust
    - Általános SQL lekérdezések futtatása
    - Típusos visszatérési érték támogatása
    - _Requirements: 2.1_

- [x] 7. Disconnect metódus implementálása
  - [x] 7.1 Implementáld a `disconnect()` metódust
    - Zárja le a kapcsolatot
    - Állítsa null-ra a connection property-t
    - _Requirements: 1.3_

- [x] 8. Checkpoint - Tesztek futtatása
  - Futtasd az összes tesztet
  - Ellenőrizd, hogy minden teszt átmegy
  - Ha kérdések merülnek fel, kérdezd meg a felhasználót

- [x] 9. Integráció az Api osztállyal (opcionális)
  - [x] 9.1 Példa endpoint létrehozása
    - Hozz létre egy példa endpointot, amely használja a Database osztályt
    - Demonstráld a tárolt eljárás hívást
    - _Requirements: 2.1_
