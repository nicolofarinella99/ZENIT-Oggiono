# ZENIT Oggiono — sito statico

Brief: `C:\Users\nikoa\Downloads\prompt-sito-zenit-oggiono.md` (HTML/CSS/JS only, niente commenti nel codice, niente dati inventati).

## Stato (v1.0 — 31/10/2026)
- Pagine: index, menu, eventi, galleria, contatti, privacy + `css/style.css`, `js/main.js`, `img/`.
- Foto, logo e menu presi dal sito Wix ufficiale del locale (zenitoggiono.wixsite.com/zenit). Logo reso trasparente in due varianti (scura/chiara) senza ridisegnarlo.
- Menu trascritto dalle immagini Wix senza codici allergeni; omessi "impasto senza glutine" e "no-glutine" (vietati dal brief), piatti speciali/promo (risotto ossobuco, galletto/ribs), menù di Pasqua, locandina aperitivo.
- Verificato: link e ancore, dimensioni immagini, nessun errore console, nessuno scroll orizzontale a 320px, logica "Aperto ora" su tutti i casi.

## v2.0 — 31/10/2026: restyling su richiesta del cliente
- Feedback: "più professionale, più bianco, arancione come accento, più animazioni, meno look da AI".
- Base bianca/#f7f5f2, unico accento arancione `--orange` #c4561d, una sola banda scura (menù a tema) + footer.
- Eliminati: sfumature tra sezioni, pillole/badge, etichette maiuscole con cerchio, cerchio-sole decorativo, frasi poetiche.
- Animazioni: zoom iniziale hero + titolo a righe, foto che si svelano (clip-path sull'img, non sul contenitore: IntersectionObserver non vede elementi clippati), parallax `[data-parallax]`, menu mobile a tendina, filtri galleria animati.
- Bug corretti: ancore del menu coperte dalla barra sticky (scroll-margin + scroll-padding si sommano), tab attiva sbagliata, CTA con logo stampato sullo sfondo.

## Decisioni
- Indicatore orari calcolato in fuso Europe/Rome (`computeStatus` in main.js).
- og:image e JSON-LD usano percorsi relativi: renderli assoluti quando il dominio è noto.

## Da fare / da confermare col cliente
- Attualità di piatti e prezzi del menu Wix; legenda dell'asterisco (*).
- Dominio definitivo per og:image e JSON-LD.
- Non pubblicare questo file sull'hosting.
