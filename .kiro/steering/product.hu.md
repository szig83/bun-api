# Termék Áttekintés

Egy könnyűsúlyú, dinamikus API keretrendszer, amely Bun-ra és Elysia-ra épül. A rendszer fájl-alapú routing mintát használ, ahol a végpontok automatikusan betöltődnek az URL útvonalak és HTTP metódusok alapján.

## Főbb Funkciók

- Dinamikus végpont betöltés: Az útvonalak a `src/endpoints/{id}.{metódus}.ts` fájlokból kerülnek feloldásra
- Egységes kéréskezelés: Minden HTTP metódus (GET, POST, stb.) egyetlen route kezelőn keresztül kerül feldolgozásra
- Strukturált válasz formátum: Konzisztens JSON válaszok `statusCode`, `result` és `errors` mezőkkel
