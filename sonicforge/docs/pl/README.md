
# Pyrite's Sonic Forge (Suno V4.5) - Dokumentacja PL

Zaawansowany generator promptów muzycznych AI, zoptymalizowany dla Suno V4.5, napędzany przez chaotyczną i hiper-inteligentną personę "Pyrite".

## Przegląd

Pyrite's Sonic Forge to aplikacja internetowa zaprojektowana, aby wypełnić lukę między kreatywną intencją a technicznym wykonaniem w generowaniu muzyki AI. Wykorzystuje modele Gemini od Google do badania artystów, analizy intencji i tworzenia profesjonalnych struktur promptów, które ściśle przestrzegają limitów znaków i systemów tagów Suno.

## Kluczowe Funkcje

- **Pełny Montaż Aplikacji (Protokół V53)**: Aplikacja jest w pełni zintegrowana, responsywna i wydajna na wszystkich urządzeniach.
- **Zarządzanie Stanem (Protokół V50)**: Modułowe zarządzanie stanem (Context API) dla promptów, historii i ustawień. Zawiera funkcję **Cofnij/Ponów** (Undo/Redo).
- **Inteligencja Multi-Modelowa**:
  - **Gemini 3 Pro Preview** dla głębokiego rozumowania i logiki strukturalnej (Tryb Myślenia).
  - **Gemini 2.5 Flash** dla badań w czasie rzeczywistym i analizy multimodalnej audio.
  - **Gemini 2.5 Flash-Lite** dla szybkich zadań, czatu i edycji tekstów.
- **Protokół Riffusion**: Pełne wsparcie dla Fuzz-1.1 z dedykowanym UI dla Siły, Dziwności (Weirdness) i Ziarna (Seed).
- **Biblioteka Szablonów**: Zakładka "Szablony" z ponad 20 zweryfikowanymi starterami gatunkowymi.
- **Soniczne Lustro (Analiza Audio)**:
  - Prześlij plik MP3/WAV (do 10MB, 5 min).
  - Wykorzystuje **Gemini 2.5 Flash Multimodal** do "słuchania" audio.
  - Inżynieria wsteczna BPM, Tonacji, Instrumentów i Stylu Produkcji.
- **Zaawansowany Edytor Tekstów (Liryczna Kuźnia)**:
  - Linter w czasie rzeczywistym z walidacją struktury.
  - Podświetlanie składni dla tagów Suno i akordów.
  - Narzędzia AI: **Flow**, **Edgy** (Pazur), **Rhyme** (Rym), **Wydłużanie Samogłosek** (`goo-o-o-odbye`) i **Adnotacje Akordów** (`(Am)`).
  - **Asystent Rymów**: Kontekstowa wyszukiwarka rymów.
- **Protokół Ekspert (Budowniczy Struktury)**:
  - **Matryca Gatunków**: Intuicyjny wybór gatunków z rekomendacjami BPM/Tonacji.
  - **Projektant Wokalu**: Szczegółowa kontrola płci, jakości i stylu wykonania.
  - **Projektant Instrumentów i Atmosfery**: Granularna kontrola instrumentów i efektów FX.
  - **Laboratorium Alchemii Lirycznej**: Narzędzia do zaawansowanych technik wokalnych.
  - Budowanie struktury metodą "przeciągnij i upuść".
  - Szablony Łuków Fabularnych (np. "Podróż Bohatera").
- **Pakiet Analizy Promptów (Protokół V52)**:
  - **Scoring**: Ocena jakości promptu (0-100) i sugestie poprawy.
  - **Porównywanie**: Podświetlanie różnic między dwoma promptami (A/B testing).
  - **Ekstrakcja Szablonów**: Tworzenie szablonów z wygenerowanych promptów.
- **Generator Seryjny (Protokół V48)**:
  - Generowanie wielu wariacji (1-10) z kontrolą poziomu zmian (lekki/średni/ciężki).
  - Ograniczenia kreatywne (zachowaj gatunek, strukturę itp.).
- **Centrum Eksportu i Udostępniania (Protokół V51)**:
  - Eksport do TXT, JSON, Markdown.
  - **Link Neuronowy**: Udostępnianie konfiguracji przez URL i kod QR.
- **Neural Chat 2.0 (Pyrite Alpha)**: Kontekstowy asystent czatu, który może modyfikować prompt, ładować historię i naprawiać błędy.
- **Ghost Protocol (Offline PWA)**: Działa jako natywna aplikacja offline (Historia, Instrukcja, Szablony).
- **Dwujęzyczny UI**: Pełne wsparcie dla języka angielskiego i polskiego.

## Nadchodzące Funkcje (Protokół V53 - Integracje v4.5+)
- **Workflow Dodawania Wokali**: UI do przesyłania instrumentalnych utworów i generowania wokali.
- **Workflow Dodawania Instrumentów**: UI do przesyłania wokali i generowania podkładów.
- **Funkcja Inspiracji**: Generowanie utworów na podstawie playlist.
- **Remaster**: Ulepszanie starych utworów do jakości v4.5.
- **Ulepszone Covery**: UI do reimaginacji utworów w innych gatunkach.

## Szybki Start

1.  **Dostęp**: Otwórz aplikację w przeglądarce.
2.  **Wybierz Ścieżkę**:
    - Zacznij od zera w **Kuźni (Forge)**.
    - Przeglądaj **Szablony**, aby załadować gotowy starter.
    - Użyj przycisku **Importuj**, aby przeanalizować istniejący prompt.
3.  **Konfiguracja**:
    - **Soniczne Lustro**: Upuść plik MP3, aby ukraść jego klimat.
    - **Referencja Artysty**: Wpisz nazwę artysty, aby pobrać jego styl produkcji.
    - **Źródło Tekstu**: Pozwól AI napisać tekst lub wklej własny.
4.  **Kuźnia**: Kliknij **ROZPOCZNIJ SEKWENCJĘ**.
5.  **Eksport**: Użyj centrum **Eksportu**, aby przenieść dane do Suno.

## Technologie

- React 19
- Google GenAI SDK
- Tailwind CSS
- Lucide React Icons
- Zod (walidacja)
- Web Workers (wydajność)
- Service Worker & PWA Manifest
