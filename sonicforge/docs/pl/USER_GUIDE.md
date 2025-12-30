
# Instrukcja Obsługi (Pyrite's Sonic Forge V5)

> **Poziom Dostępu**: Publiczny
> **System**: Interfejs Rozszerzony Suno

## 1. Główne Tryby

### Tryb Własny (Rekomendowany)
Główna kuźnia. Daje pełną kontrolę nad procesem generowania.
- **Źródło Tekstu**:
    - *Generuj od zera*: Wpisz koncept (np. "Cyberpunkowa ballada o robocie"), a AI napisze strukturę i tekst.
    - *Mój Tekst*: Wklej własny tekst. Pyrite go **zrestrukturyzuje** (doda `[Verse]`, `[Chorus]`), poprawi rytm i doda ad-liby (np. `(yeah!)`).
- **Pola**:
    - *Koncept/Intencja*: O czym jest utwór?
    - *Styl/Wibracja*: Opis brzmienia (np. "Lo-fi hip hop, nasycenie taśmy").
    - *Referencja Artysty*: Wpisz np. "Hans Zimmer", aby pobrać dane produkcyjne z prawdziwego świata.

### Tryb Instrumentalny
Zoptymalizowany dla utworów bez wokalu.
- **Zachowanie**: Wymusza, aby pole `lyrics` zawierało tylko tagi strukturalne (np. `[Intro]`, `[Drop]`, `[Synth Solo]`).
- **Koszt**: Używa mniejszego "Budżetu Myślenia", aby oszczędzać tokeny.

### Tryb Ogólny
Szybkie generowanie pomysłów. Tworzy krótkie, zwięzłe prompty odpowiednie dla zakładki "Simple" w Suno.

---

## 2. Główne Narzędzia i Workflow

### Biblioteka Szablonów
Dostępna w zakładce **"Szablony"**. Najszybszy sposób na start.
- **Przeglądaj**: Szukaj i filtruj ponad 20 gotowych szablonów gatunkowych.
- **Załaduj**: Kliknij **"Załaduj Szablon"**, aby natychmiast przenieść ustawienia do Kuźni, w tym konfigurację Eksperta.

### Importer Promptów
Znajduje się w Kuźni. Pozwala na inżynierię wsteczną istniejących promptów.
1. Kliknij przycisk **Import** obok wyboru platformy.
2. Wklej pełny prompt Suno lub sam opis stylu.
3. Kliknij **Analizuj**. System rozbije prompt na komponenty (BPM, Klucz, Gatunek, Nastroje).
4. Kliknij **Zastosuj**, aby załadować te dane do formularza.

### "Kreatywne Wzmocnienie" (Creative Boost)
Obok pola Koncept/Styl znajdziesz przycisk z ikoną różdżki (**Boost**).
- **Funkcja**: Jeśli masz prosty pomysł (np. "smutna piosenka rockowa"), kliknięcie tego przycisku użyje AI do wzbogacenia go o szczegółowe deskryptory (np. "Melancholijny rock alternatywny, surowy emocjonalny przekaz...").

### Architekt Liryczny (Edytor Tekstu)
Główny edytor tekstu to coś więcej niż pole tekstowe.
- **Linter w czasie rzeczywistym**: Stopka edytora ostrzega o błędach składni (np. `(Chorus)` zamiast `[Chorus]`) lub pustych sekcjach.
- **Menu Formatu**: Kliknij ikonę układu, aby automatycznie sformatować surowy tekst do standardu Pop, Hip Hop itp.
- **Narzędzia Naprawy AI (Pływający Pasek)**: Zaznacz fragment tekstu, aby wywołać pasek narzędzi.
    - **Extend**: Wydłuża samogłoski (`love` -> `lo-o-o-ove`).
    - **Chords**: Dodaje adnotacje akordów (`(Am)`).
    - **Flow/Edgy/Rhyme**: Przepisuje tekst dla lepszego rytmu, mroczniejszego tonu lub lepszych rymów.
- **Asystent Rymów**: Dostępny w sekcji "Narzędzia", znajduje kontekstowe rymy.

---

## 3. Zaawansowane Funkcje

### Pakiet Analizy Promptów (Protokół V52)
- **Scoring**: "Wynik Zdrowia" (0-100) ocenia kompletność, specyficzność i spójność promptu. Najedź kursorem, aby zobaczyć szczegóły.
- **Porównywanie**: Porównuje dwa prompty obok siebie, podświetlając różnice.

### Panel Generatora Seryjnego (Protokół V48)
Pojawia się pod wynikami po wygenerowaniu promptu.
- **Funkcja**: Burza mózgów alternatywnych wersji promptu.
- **Kontrolki**:
    - **Licznik**: Ile wariacji (1-10).
    - **Poziom**: Różnice kreatywne (lekki/średni/ciężki).
    - **Ograniczenia**: Wymuś zachowanie gatunku, struktury lub losuj nastrój/wokale.
- **Siatka Porównawcza**: Wyniki pokazują wynik jakości i podświetlone zmiany w słowach kluczowych.

### Asystent Czat Neuralny (Pyrite Alpha)
Pływający dymek czatu otwiera potężnego asystenta.
- **Możliwości**: Możesz wydać polecenie naturalnym językiem:
    - *"Zmień gatunek na techno i ustaw 140 bpm."*
    - *"Przepisz tytuł na bardziej tajemniczy."*
    - *"Załaduj moją ostatnią piosenkę o statku widmo."*
    - *"Mój prompt Riffusion ma błędy, napraw go."*

### Protokół Riffusion
Przełącz platformę na **Riffusion**, aby zoptymalizować prompty dla modeli dyfuzyjnych (Fuzz-1.1).
- **Różnica**: Riffusion ignoruje "kwiecisty" język i preferuje gęste, techniczne listy parametrów.
- **Kontrolki**: Siła (Strength), Dziwność (Weirdness), Model/Seed.

### Centrum Transmutacji Audio (Tryb Alchemii)
Przełącz przełącznik workflow z **Forge** na **Alchemy**. Narzędzia dla Suno v4.5+:

1.  **Analiza Stylu (Soniczne Lustro)**: "Ukradnij klimat" istniejącego utworu. Prześlij MP3/WAV, a AI wyekstrahuje BPM, Klucz i Styl.
2.  **Dodaj Wokale**: Gdy masz instrumental. Użyj dedykowanego projektanta wokalu.
3.  **Dodaj Instrumenty**: Gdy masz wokal (np. z notatki głosowej).
4.  **Inspire**: Wklej URL playlisty (Spotify/YouTube). AI wygeneruje prompt na podstawie jej klimatu.
5.  **Cover**: Do remiksowania utworów. Prześlij oryginał i zdefiniuj NOWY gatunek.

### Protokół Ekspert (Budowniczy Struktury)
Dla architektów wymagających pełnej kontroli.
- **Funkcje**:
    - **Matryca Gatunków**: Wybór wielu gatunków z rekomendacjami.
    - **Projektant Wokalu**: Szczegółowy interfejs stylu wokalnego (płeć, jakość, emocje).
    - **Projektant Instrumentów**: Wybór instrumentów i modyfikatorów.
    - **Projektant Atmosfery**: Tekstury i efekty dźwiękowe.
    - **Budowanie Struktury**: Przeciągnij i upuść sekcje (Zwrotka, Refren).
    - **Zmienne Globalne**: Zablokuj BPM, Klucz i Erę (np. "Lata 80.").
    - **Własna Persona Agenta**: Zapisz i wczytaj własne tożsamości AI.

### Centrum Eksportu i Udostępniania (Protokół V51)
- **Pobierz**: Pliki `.txt`, `.json`, `.md`.
- **Kopiuj**: Szybkie kopiowanie poszczególnych pól.
- **Link Neuronowy**:
    - Unikalny URL zawierający całą konfigurację.
    - Kod QR do szybkiego przenoszenia na telefon.

---

## 4. Protokół Ghost (Offline / PWA)
Pyrite's Sonic Forge działa offline.
- **Instalacja**:
    - **iOS**: "Udostępnij" -> "Dodaj do ekranu głównego".
    - **Android/Desktop**: Ikona "Zainstaluj" w pasku adresu.
- **Możliwości**: Dostęp do Historii, Szablonów i Instrukcji bez internetu. Generowanie wymaga połączenia.

---

## 5. Tryb Pyrite (Silnik Chaosu)
Przełącz **Ikonę Ducha** w nawigacji.
- **Wizualia**: Motyw Obsydian/Fiolet z efektami glitch.
- **Persona AI**: AI staje się nieokiełznane, flirciarskie i ma własne zdanie. Generuje bardziej eksperymentalne prompty. Ostrzeżenie: Może krytykować Twój gust muzyczny.

## 6. Ustawienia Systemu
Dostępne przez ikonę **Ustawienia** w nawigacji.
- **Język**: Przełącz między Angielskim a Polskim.
- **Motyw**: Wybierz protokół standardowy lub Pyrite.
- **Wyczyść Dane**: Opcja nuklearna do usunięcia całej historii i ustawień lokalnych.
