GYM PROGRESS 3.9.1 — AUTOMATISCHE CLOUDSYNC (BETA)

1. Maak eerst op de iPhone een JSON-back-up van je bestaande app.
2. Publiceer ALLE bestanden in deze ZIP samen via GitHub Pages.
3. Open Meer → Supabase synchronisatie en log in.
4. Als je eerder al hebt geüpload, blijft automatische sync actief op hetzelfde apparaat.
   Controleer de status en maak een kleine testwijziging.
5. Na elke opgeslagen wijziging synchroniseert de app na circa 1,6 seconden.
6. Bij netwerkverlies blijft alles lokaal en wordt opnieuw geprobeerd bij verbinding,
   terugkeer naar de app en periodiek.
7. Bij conflicten met een andere cloudversie stopt de upload om overschrijven te voorkomen.
   Download niet blind: maak een JSON-back-up en vergelijk eerst.
8. Een lopende training (draft) blijft lokaal totdat je de training afrondt.
9. Geen nieuw SQL-script nodig; gebruikt bestaande gym_cloud_state en RPC.

LET OP: synchronisatie is nog snapshot-gebaseerd, zonder samenvoegen van wijzigingen
van twee apparaten. Gebruik niet tegelijk twee apparaten voor invoer.
Een record in de cloud alleen bewijst niet dat alle velden kloppen: controleer je historie.
