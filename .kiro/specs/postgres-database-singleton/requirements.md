# Requirements Document

## Bevezetés

Egy singleton PostgreSQL adatbázis osztály, amely Bun beépített postgres támogatását használja. Az osztály biztosítja, hogy csak egyetlen kapcsolat jöjjön létre az adatbázissal, és lehetővé teszi tárolt eljárások típusos futtatását.

## Szójegyzék

- **Database**: Az adatbázis singleton osztály, amely kezeli a PostgreSQL kapcsolatot
- **Stored Procedure**: Tárolt eljárás, amely az adatbázis szerveren fut
- **Singleton Pattern**: Tervezési minta, amely biztosítja, hogy egy osztályból csak egyetlen példány létezzen
- **Connection**: PostgreSQL adatbázis kapcsolat
- **Bun Postgres**: Bun beépített PostgreSQL támogatása

## Követelmények

### Követelmény 1

**User Story:** Fejlesztőként szeretnék egy singleton adatbázis osztályt, hogy az alkalmazás csak egyszer kapcsolódjon az adatbázishoz és ne hozzon létre felesleges kapcsolatokat.

#### Elfogadási Kritériumok

1. WHEN a Database osztály példányosítása többször megtörténik THEN a rendszer ugyanazt a példányt adja vissza minden alkalommal
2. WHEN az alkalmazás elindul THEN a Database osztály automatikusan kapcsolódik a PostgreSQL adatbázishoz
3. WHEN a kapcsolat létrejön THEN a rendszer tárolja a kapcsolat objektumot későbbi használatra
4. WHEN a kapcsolat már létezik THEN a rendszer nem hoz létre új kapcsolatot

### Követelmény 2

**User Story:** Fejlesztőként szeretnék tárolt eljárásokat futtatni típusos visszatérési értékekkel, hogy típusbiztos módon dolgozhassak az adatbázis eredményekkel.

#### Elfogadási Kritériumok

1. WHEN egy tárolt eljárást hívok meg paraméterekkel THEN a rendszer végrehajtja az eljárást a megadott paraméterekkel
2. WHEN egy tárolt eljárás visszatérési típust definiálok THEN a rendszer az eredményt a megadott típussal adja vissza
3. WHEN egy tárolt eljárás listát ad vissza THEN a rendszer a lista elemeit a megadott típussal adja vissza
4. WHEN egy tárolt eljárás konkrét értékeket ad vissza THEN a rendszer az értékeket a megadott típussal adja vissza
5. WHEN egy tárolt eljárás hibát dob THEN a rendszer megfelelően kezeli a hibát és továbbítja a hívónak

### Követelmény 3

**User Story:** Fejlesztőként szeretném konfigurálni az adatbázis kapcsolatot környezeti változókból, hogy különböző környezetekben (dev, staging, production) különböző adatbázisokhoz kapcsolódhassak.

#### Elfogadási Kritériumok

1. WHEN az alkalmazás elindul THEN a Database osztály beolvassa a kapcsolati paramétereket környezeti változókból
2. WHEN a DATABASE_URL környezeti változó be van állítva THEN a rendszer ezt használja a kapcsolódáshoz
3. WHEN a kapcsolati paraméterek hiányoznak THEN a rendszer értelmes hibaüzenetet ad vissza
4. WHEN a kapcsolódás sikertelen THEN a rendszer naplózza a hibát és újrapróbálkozik vagy hibát dob

### Követelmény 4

**User Story:** Fejlesztőként szeretnék biztonságos paraméter-kezelést, hogy SQL injection támadások ellen védve legyek.

#### Elfogadási Kritériumok

1. WHEN paramétereket adok át egy tárolt eljárásnak THEN a rendszer paraméteres lekérdezést használ
2. WHEN a paraméterek tartalmaz speciális karaktereket THEN a rendszer megfelelően escape-eli őket
3. WHEN a tárolt eljárás meghívása történik THEN a rendszer soha nem fűz össze stringeket SQL injection kockázatával
