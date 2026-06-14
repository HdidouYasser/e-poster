# Plan de Projet & Diagramme de Gantt (9 Semaines)
## Refonte Dynamique de la Plateforme E-Poster / Totem Événementiel

---

## 1. Synthèse du Projet & Cadrage
Ce projet de fin d'études (stage technique de Bachelor en Génie Logiciel) réalise la refonte complète de la plateforme d'e-posters événementiels pour l'agence **DEV PUB SOLUTION**. 

---

## 2. Diagramme de Gantt (Version Détaillée et Lisible pour Rapport)

```mermaid
%%{init: {
  "theme": "base",
  "themeVariables": {
    "taskBkgColor": "#e0e7ff",
    "taskBorderColor": "#4f46e5",
    "taskTextColor": "#1e1b4b",
    "taskTextOutsideColor": "#1e293b",
    "sectionBkgColor": "#ffffff",
    "altSectionBkgColor": "#f8fafc",
    "gridColor": "#cbd5e1",
    "titleColor": "#0f172a",
    "activeTaskBkgColor": "#cffafe",
    "activeTaskBorderColor": "#0891b2",
    "activeTaskTextColor": "#083344",
    "doneTaskBkgColor": "#d1fae5",
    "doneTaskBorderColor": "#10b981",
    "doneTaskTextColor": "#064e3b"
  }
}}%%
gantt
    title Planification de Projet - E-Poster (9 Semaines)
    dateFormat YYYY-MM-DD
    axisFormat %d/%m
    tickInterval 1week
    todayMarker off

    section S1 - Analyse & Cadrage
    Audit technique du code PHP & DB hérités :done, p1_1, 2026-03-02, 3d
    Rédaction des spécifications & CDC final :done, p1_2, after p1_1, 4d

    section S2 - Modélisation & Setup
    Diagrammes UML (Cas, Classes, Séquences)  :done, p2_1, 2026-03-09, 3d
    Modélisation du schéma physique MySQL (3NF) :done, p2_2, after p2_1, 2d
    Setup Spring Boot 3 & React 18 (Vite)     :done, p2_3, after p2_2, 2d

    section S3 - Backend: Sécurité & Auth
    Spring Security stateless & JWT local     :active, p3_1, 2026-03-16, 4d
    OAuth2 Google Sign-In & Auto-provisioning :active, p3_2, after p3_1, 3d

    section S4 - Backend: Architecture Core
    Entités relationnelles JPA & Soft Delete  :p3_3, 2026-03-23, 3d
    REST Controllers & PlatformFacade API     :p3_4, after p3_3, 4d

    section S5 - Backend: Imports & Médias
    Upload PDF & vignette image (PDFBox)      :p4_1, 2026-03-30, 3d
    Parser Excel/CSV bulk import (POI)        :p4_2, after p4_1, 2d
    Audit system logs & Sync DB maintenance   :p4_3, after p4_2, 2d

    section S6 - Frontend: Espace Admin
    Router, RBAC context & intercepteur JWT   :p5_1, 2026-04-06, 2d
    CRUD Events & Publications (React Query)  :p5_2, after p5_1, 3d
    UI Import Excel & Dashboard admin scoped  :p5_3, after p5_2, 2d

    section S7 - Frontend: Totem & Sync UI
    Grille tactile virtualisée & Recherche FT  :p6_1, 2026-04-13, 2d
    Clavier virtuel AZERTY tactile            :p6_2, after p6_1, 2d
    Visionneuse PDF (Zoom) & Slideshow veille :p6_3, after p6_2, 1d
    Synchronisation multi-écrans Broadcast    :p6_4, after p6_3, 2d

    section S8 - Tests & Recette
    Tests unitaires & d'intégration (JUnit)   :p7_1, 2026-04-20, 3d
    Recette fonctionnelle sur matériel réel    :p7_3, after p7_1, 4d

    section S9 - Production & Clôture
    Build prod (JAR, SPA), Docker Compose     :p8_1, 2026-04-27, 3d
    Rédaction documentations & rapport final  :p8_2, after p8_1, 2d
    Préparation de la soutenance              :p8_3, after p8_2, 2d
