
# Rozwiązywanie Problemów

> **Status Systemu**: ONLINE
> **Protokół Wsparcia**: Samoobsługa Użytkownika

## Częste Problemy

### 1. "CORE OVERLOAD (429)" / Limity API
**Objaw**: Czerwony komunikat "CORE OVERLOAD".
**Przyczyna**: Przekroczono limit zapytań do Google Gemini API.
**Rozwiązanie**:
- Odczekaj 60 sekund i spróbuj ponownie.
- Jeśli używasz darmowego klucza API, limit to 15 zapytań na minutę.

### 2. Płaski Wizualizator Audio (Brak Ruchu)
**Objaw**: Wizualizator w tle jest płaską linią, mimo że dźwięk jest włączony.
**Przyczyna**: Przeglądarka zablokowała `AudioContext` (polityka autostartu).
**Rozwiązanie**:
- **Interakcja**: Kliknij gdziekolwiek na stronie. Przeglądarki wymagają gestu użytkownika, aby włączyć audio.
- **Sprawdź Wyciszenie**: Upewnij się, że ikona głośnika w nawigacji nie jest przekreślona.

### 3. PWA / Tryb Offline Nie Działa
**Objaw**: Nie pojawia się opcja "Dodaj do ekranu głównego" lub aplikacja nie ładuje się offline.
**Przyczyna**: Service Worker może oczekiwać na aktywację.
**Rozwiązanie**:
- Odśwież stronę, aby nowy Service Worker przejął kontrolę.
- Upewnij się, że używasz **HTTPS** (lub `localhost`). Service Workers nie działają na niezabezpieczonych połączeniach.

### 4. "Safety Lockout" (Blokada Bezpieczeństwa)
**Objaw**: Generowanie kończy się błędem "Safety Filters Triggered".
**Przyczyna**: Twój prompt zawiera treści oflagowane przez filtry bezpieczeństwa Google (mowa nienawiści, przemoc, treści seksualne).
**Rozwiązanie**:
- Złagodź język. Używaj metafor zamiast dosłownych opisów.
- **Tryb Pyrite** rozluźnia instrukcje systemowe, ale twarde filtry API są wymuszane przez Google.

### 5. Błąd Sonicznego Lustra (Przesyłanie Audio)
**Objaw**: "File too large" lub nieskończone ładowanie.
**Przyczyna**:
- Plik przekracza 10MB.
- Format inny niż MP3/WAV.
**Rozwiązanie**:
- Skompresuj plik lub przytnij go do 30-sekundowego fragmentu. AI potrzebuje tylko próbki, by uchwycić klimat.

### 6. Szuflada Mobilna (Drawer) Nie Otwiera Się
**Objaw**: Kliknięcie "Protokół Ekspert" na telefonie nie działa.
**Przyczyna**: Konflikt Z-index lub błąd JS.
**Rozwiązanie**:
- Odśwież stronę.
- Upewnij się, że okno czatu nie zasłania przycisku.

---

## Twardy Reset (Hard Reset)
Jeśli stan aplikacji ulegnie uszkodzeniu (np. utknie na ładowaniu):
1. Otwórz Narzędzia Deweloperskie (F12) -> Application -> Storage.
2. Kliknij **Clear Site Data** (Wyczyść dane witryny).
3. Przeładuj stronę.
