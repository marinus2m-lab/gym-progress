GYM PROGRESS 3.9.0 — VEILIGE CLOUD-BACK-UP (BETA)

1. Maak in de bestaande app via Meer een JSON-back-up.
2. Voer supabase-cloud-setup.sql uit in het Vivavos Supabase-project.
3. Plaats index.html, app.js, cloud.js, sw.js, manifest en iconen samen op je HTTPS-host.
4. Open de app -> Meer -> Supabase synchronisatie. Log in met je Supabase Authentication-gebruiker.
5. Op je iPhone met bestaande historie: kies Lokale gegevens naar cloud.
6. Op een tweede apparaat: kies Cloud naar dit apparaat (na lokale back-up).

BELANGRIJK:
- Geen geheime sleutels in de app; alleen publieke project-URL en publishable key.
- De bestaande acht tabellen blijven intact. De nieuwe gym_cloud_state-tabel bewaart de volledige PWA-gegevens zonder verlies van eigen velden.
- Cloud synchroniseert bij save(), niet per afzonderlijke toets. Een lopende training (draft) blijft lokaal tot deze wordt afgerond.
- Niet tegelijk op twee apparaten werken. Bij een versieconflict stopt synchronisatie. Geen automatische samenvoeging.
- Offline wijzigingen worden lokaal opgeslagen; synchronisatie wordt opnieuw geprobeerd na een volgende wijziging wanneer online.
- Bestaande cloud wordt niet automatisch overschreven tijdens eerste upload.
- De service worker cache is verhoogd naar 3.9.0.
- Als inloggen mislukt, controleer Authentication -> Providers -> Email en of het account bevestigd is.
- Dit is een veilige eerste cloud-koppeling, geen volledige migratie naar de acht genormaliseerde tabellen.
