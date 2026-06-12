# Diagrammes UML corrigés — E-Poster Platform

> Chaque bloc `mermaid` est un diagramme indépendant à copier sur https://mermaid.live

---

## 1. Diagramme de classes — Couche Modèle & Données

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'fontSize': '14px'}}}%%
classDiagram
    direction TB

    class Publication {
        «Entity»
        -Long id
        -String title
        -String abstractText
        -String description
        -String status
        -String session
        -String room
        -String posterUrl
        -Integer viewCount
        -String authors
        -String category
        -Instant publishDate
    }

    class Event {
        «Entity»
        -Long id
        -String title
        -String description
        -String status
        -Instant startDate
        -Instant endDate
        -String logoUrl
        -String colorPrimary
        -String colorSecondary
        -String bannerUrl
        -String programUrl
        -String revueUrl
    }

    class Category {
        «Entity»
        -Long id
        -String name
        -String type
        -String description
    }

    class Author {
        «Entity»
        -Long id
        -String firstName
        -String lastName
        -String email
        -String affiliation
        -Boolean isCorresponding
    }

    class PublicationAuthor {
        «Join Entity»
        -Long id
        -Integer authorOrder
    }

    class PublicationCategory {
        «Join Entity»
        -Long id
    }

    class Media {
        «Entity»
        -Long id
        -String filePath
        -String fileName
        -String fileType
        -Long fileSize
        -String thumbnailPath
        -Integer width
        -Integer height
    }

    class PublicationRepository {
        «Repository»
        +findByDeletedAtIsNull(Pageable) Page
        +searchFullText(q, ...) Page
    }

    %% Relations
    Publication "many" --> "1" Event : ManyToOne
    Publication "1" *-- "many" Media : composition
    Publication "1" *-- "many" PublicationAuthor : composition
    Author "1" *-- "many" PublicationAuthor : composition
    Publication "1" *-- "many" PublicationCategory : composition
    Category "1" *-- "many" PublicationCategory : composition
    PublicationRepository ..> Publication : gère

    style Publication fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,color:#000
    style Event fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,color:#000
    style Category fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,color:#000
    style Author fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,color:#000
    style Media fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,color:#000
    style PublicationAuthor fill:#FFF3E0,stroke:#E65100,stroke-width:1.5px,color:#000
    style PublicationCategory fill:#FFF3E0,stroke:#E65100,stroke-width:1.5px,color:#000
    style PublicationRepository fill:#E3F2FD,stroke:#1565C0,stroke-width:1.5px,color:#000
```

---

## 2. Diagramme de classes — Couche Service (Patterns)

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'fontSize': '14px'}}}%%
classDiagram
    direction TB

    class PlatformFacade {
        «Facade»
        -PublicationService publicationService
        -EventService eventService
        -ScreenService screenService
        -CategoryService categoryService
        +getPublications(page, size, sort) ApiPageResponse
        +getPublicationDetail(id) Publication
        +getAllEvents() List~Event~
        +getEventDetail(id) Event
        +getScreensByEvent(eventId) List~Screen~
        +getScreenDetail(id) Screen
        +getCategoriesByEvent(eventId) List~Category~
        +getEventWithScreens(eventId) Event
        +getStatistics() Map
    }

    class PublicationService {
        «Service»
        +list(Pageable) Page
        +getById(Long) Publication
        +create(Publication) Publication
        +update(Long, Publication) Publication
        +delete(Long) void
        +search(String, Long, Pageable) Page
        +getTotalViews() long
        +getTopViewed() List~Publication~
    }

    class EventService {
        «Service»
        +list(Pageable) Page
        +getById(Long) Event
        +create(Event) Event
        +update(Long, Event) Event
        +delete(Long) void
    }

    class ScreenService {
        «Service»
        +list(Long) List~Screen~
        +getById(Long) Screen
        +create(Screen) Screen
        +update(Long, Screen) Screen
    }

    class CategoryService {
        «Service»
        +list(Long, String) List~Category~
        +create(Category) Category
        +update(Long, Category) Category
    }

    class DashboardService {
        «Service»
        +getDashboardData() DashboardDTO
    }

    class ImportParser {
        «Interface»
        +parse(MultipartFile, String) List~Publication~
    }

    class CsvAdapter {
        «Adapter»
        +parse(MultipartFile, String) List~Publication~
    }

    class ExcelAdapter {
        «Adapter»
        +parse(MultipartFile, String) List~Publication~
    }

    class ImportParserFactory {
        «Factory»
        -CsvAdapter csvAdapter
        -ExcelAdapter excelAdapter
        +createParser(String) ImportParser
    }

    class PublicationBuilder {
        «Builder»
        -Publication publication
        -List~Author~ authors
        -List~Media~ mediaList
        +title(String) PublicationBuilder
        +abstractText(String) PublicationBuilder
        +description(String) PublicationBuilder
        +event(Event) PublicationBuilder
        +authors(String) PublicationBuilder
        +category(String) PublicationBuilder
        +addAuthor(Author, Integer) PublicationBuilder
        +addMedia(Media) PublicationBuilder
        +build() Publication
    }

    %% Relations
    ImportParser <|.. CsvAdapter
    ImportParser <|.. ExcelAdapter
    ImportParserFactory ..> ImportParser : crée
    CsvAdapter ..> PublicationBuilder : utilise
    ExcelAdapter ..> PublicationBuilder : utilise
    PlatformFacade --> PublicationService
    PlatformFacade --> EventService
    PlatformFacade --> ScreenService
    PlatformFacade --> CategoryService

    style PlatformFacade fill:#F3E5F5,stroke:#6A1B9A,stroke-width:2px,color:#000
    style PublicationService fill:#E3F2FD,stroke:#1565C0,stroke-width:1.5px,color:#000
    style EventService fill:#E3F2FD,stroke:#1565C0,stroke-width:1.5px,color:#000
    style ScreenService fill:#E3F2FD,stroke:#1565C0,stroke-width:1.5px,color:#000
    style CategoryService fill:#E3F2FD,stroke:#1565C0,stroke-width:1.5px,color:#000
    style DashboardService fill:#E3F2FD,stroke:#1565C0,stroke-width:1.5px,color:#000
    style ImportParser fill:#ECEFF1,stroke:#455A64,stroke-width:1.5px,color:#000
    style CsvAdapter fill:#FFF3E0,stroke:#E65100,stroke-width:1.5px,color:#000
    style ExcelAdapter fill:#FFF3E0,stroke:#E65100,stroke-width:1.5px,color:#000
    style ImportParserFactory fill:#F3E5F5,stroke:#6A1B9A,stroke-width:1.5px,color:#000
    style PublicationBuilder fill:#F3E5F5,stroke:#6A1B9A,stroke-width:1.5px,color:#000
```

---

## 3. Diagramme de classes — Couche Présentation

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'fontSize': '14px'}}}%%
classDiagram
    direction TB

    class React_PublicationsAdmin {
        «View»
        -String q
        -int page
        +onSubmit(values)
        +handleFileUpload(e)
        +exportCSV()
    }

    class React_Home {
        «View»
        -Long activeEventId
        -String searchQuery
        +renderTotemGrid()
        +onSelectPoster(id)
    }

    class AuthController {
        «Controller»
        +login(req) ResponseEntity
        +register(req) ResponseEntity
    }

    class UserController {
        «Controller»
        +list() List~User~
        +create(user) User
        +update(id, user) User
        +delete(id) void
    }

    class PublicationController {
        «Controller»
        +list(page, size, sort) ApiPageResponse
        +search(q, eventId) Page
        +getDetail(id) Publication
        +create(p) Publication
        +update(id, p) Publication
        +delete(id) void
    }

    class PublicationImportController {
        «Controller»
        +importPublications(file, eventId) ResponseEntity
    }

    class EventController {
        «Controller»
        +list() List~Event~
        +getDetail(id) Event
        +create(event) Event
        +update(id, event) Event
        +delete(id) void
    }

    class ScreenController {
        «Controller»
        +list(eventId) List~Screen~
        +create(screen) Screen
        +update(id, screen) Screen
    }

    class CategoryController {
        «Controller»
        +list(eventId) List~Category~
        +create(cat) Category
        +update(id, cat) Category
    }

    class PlatformFacadeController {
        «Controller»
        +getEventBranding(eventId) ResponseEntity
        +getScreensAndCategories(eventId) ResponseEntity
    }

    class DashboardController {
        «Controller»
        +getDashboard() DashboardDTO
    }

    class AdminController {
        «Controller»
        +getAdminData() Map
    }

    %% Relations
    React_PublicationsAdmin ..> PublicationController : HTTP
    React_PublicationsAdmin ..> PublicationImportController : HTTP
    React_Home ..> PlatformFacadeController : HTTP

    style React_PublicationsAdmin fill:#E8EAF6,stroke:#283593,stroke-width:1.5px,color:#000
    style React_Home fill:#E8EAF6,stroke:#283593,stroke-width:1.5px,color:#000
    style AuthController fill:#FCE4EC,stroke:#AD1457,stroke-width:1.5px,color:#000
    style UserController fill:#FCE4EC,stroke:#AD1457,stroke-width:1.5px,color:#000
    style PublicationController fill:#FCE4EC,stroke:#AD1457,stroke-width:1.5px,color:#000
    style PublicationImportController fill:#FCE4EC,stroke:#AD1457,stroke-width:1.5px,color:#000
    style EventController fill:#FCE4EC,stroke:#AD1457,stroke-width:1.5px,color:#000
    style ScreenController fill:#FCE4EC,stroke:#AD1457,stroke-width:1.5px,color:#000
    style CategoryController fill:#FCE4EC,stroke:#AD1457,stroke-width:1.5px,color:#000
    style PlatformFacadeController fill:#FCE4EC,stroke:#AD1457,stroke-width:1.5px,color:#000
    style DashboardController fill:#FCE4EC,stroke:#AD1457,stroke-width:1.5px,color:#000
    style AdminController fill:#FCE4EC,stroke:#AD1457,stroke-width:1.5px,color:#000
```

---

## 4. Diagramme UML complet — Toutes les classes

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'fontSize': '13px'}}}%%
classDiagram
    direction LR

    class User {
        -Long id
        -String email
        -String passwordHash
        -String firstName
        -String lastName
        -String avatarUrl
    }

    class Role {
        -Long id
        -String name
        -String description
    }

    class Event {
        -Long id
        -String title
        -String description
        -String status
        -Instant startDate
        -Instant endDate
        -String logoUrl
        -String colorPrimary
        -String colorSecondary
        -String bannerUrl
        -String programUrl
        -String revueUrl
    }

    class Screen {
        -Long id
        -String name
        -String location
        -String mode
        -String resolution
        -Boolean isActive
    }

    class ScreenSection {
        -Long id
        -String title
        -Integer position
    }

    class ScreenComponent {
        «interface»
        +display() String
    }

    class Publication {
        -Long id
        -String title
        -String abstractText
        -String description
        -String status
        -String session
        -String room
        -String posterUrl
        -Integer viewCount
        -String authors
        -String category
        -Instant publishDate
    }

    class Author {
        -Long id
        -String firstName
        -String lastName
        -String email
        -String affiliation
        -Boolean isCorresponding
    }

    class Category {
        -Long id
        -String name
        -String type
        -String description
    }

    class PublicationAuthor {
        -Long id
        -Integer authorOrder
    }

    class PublicationCategory {
        -Long id
    }

    class Media {
        -Long id
        -String filePath
        -String fileName
        -String fileType
        -Long fileSize
        -String thumbnailPath
        -Integer width
        -Integer height
    }

    class ImportRecord {
        -Long id
        -String fileName
        -String fileType
        -Integer totalRows
        -Integer successRows
        -Integer failedRows
        -String status
        -String errorMessage
        -String importedBy
        -Instant importedAt
        -Instant completedAt
    }

    class ImportParser {
        «interface»
        +parse(file, eventId) List
    }

    class CsvAdapter {
        +parse(file, eventId) List
    }

    class ExcelAdapter {
        +parse(file, eventId) List
    }

    class ImportParserFactory {
        «Factory»
        +createParser(filename) ImportParser
    }

    class AuditLog {
        -Long id
        -String username
        -String entityType
        -Long entityId
        -String action
        -String details
    }

    class PlatformFacade {
        «Facade»
        +getPublications(page, size, sort)
        +getPublicationDetail(id)
        +getAllEvents()
        +getEventDetail(id)
        +getScreensByEvent(eventId)
        +getScreenDetail(id)
        +getCategoriesByEvent(eventId)
        +getStatistics()
    }

    class PublicationBuilder {
        «Builder»
        +title()
        +abstractText()
        +description()
        +event()
        +authors()
        +category()
        +addAuthor()
        +addMedia()
        +build()
    }

    %% === AUTH ===
    User "many" --> "1" Role : ManyToOne

    %% === EVENT ===
    Event "1" o-- "many" Screen : contient
    Event "1" o-- "many" Publication : regroupe
    Event "1" o-- "many" Category : définit
    Event "1" --> "1" User : manager

    %% === SCREEN (Composite) ===
    ScreenComponent <|.. Screen
    ScreenComponent <|.. ScreenSection
    Screen "1" o-- "many" ScreenSection : compose
    ScreenSection "many" --> "1" Publication : affiche

    %% === PUBLICATION ===
    Publication "1" -- "many" PublicationAuthor : via
    Author "1" -- "many" PublicationAuthor : via
    Publication "1" -- "many" PublicationCategory : via
    Category "1" -- "many" PublicationCategory : via
    Publication "1" o-- "many" Media : contient

    %% === IMPORT ===
    ImportParser <|.. CsvAdapter
    ImportParser <|.. ExcelAdapter
    ImportParserFactory ..> ImportParser : crée

    %% === PATTERNS ===
    PlatformFacade --> Event : orchestre
    PlatformFacade --> Screen : orchestre
    PlatformFacade --> Publication : orchestre
    PlatformFacade --> Category : orchestre
    PublicationBuilder --> Publication : construit
    PublicationBuilder --> Author : associe
    PublicationBuilder --> Media : associe

    %% === AUDIT ===
    AuditLog ..> User : trace
    AuditLog ..> Event : trace
    AuditLog ..> Publication : trace

    style User fill:#E3F2FD,stroke:#1565C0,stroke-width:2px,color:#000
    style Role fill:#E3F2FD,stroke:#1565C0,stroke-width:2px,color:#000
    style Event fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,color:#000
    style Screen fill:#FFF3E0,stroke:#E65100,stroke-width:1.5px,color:#000
    style ScreenSection fill:#FFF3E0,stroke:#E65100,stroke-width:1.5px,color:#000
    style ScreenComponent fill:#ECEFF1,stroke:#455A64,stroke-width:1.5px,color:#000
    style Publication fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,color:#000
    style Author fill:#E8F5E9,stroke:#2E7D32,stroke-width:1.5px,color:#000
    style Category fill:#E8F5E9,stroke:#2E7D32,stroke-width:1.5px,color:#000
    style PublicationAuthor fill:#FFF9C4,stroke:#F57F17,stroke-width:1.5px,color:#000
    style PublicationCategory fill:#FFF9C4,stroke:#F57F17,stroke-width:1.5px,color:#000
    style Media fill:#E8F5E9,stroke:#2E7D32,stroke-width:1.5px,color:#000
    style ImportRecord fill:#F3E5F5,stroke:#6A1B9A,stroke-width:1.5px,color:#000
    style ImportParser fill:#ECEFF1,stroke:#455A64,stroke-width:1.5px,color:#000
    style CsvAdapter fill:#F3E5F5,stroke:#6A1B9A,stroke-width:1.5px,color:#000
    style ExcelAdapter fill:#F3E5F5,stroke:#6A1B9A,stroke-width:1.5px,color:#000
    style ImportParserFactory fill:#F3E5F5,stroke:#6A1B9A,stroke-width:1.5px,color:#000
    style AuditLog fill:#FFEBEE,stroke:#B71C1C,stroke-width:1.5px,color:#000
    style PlatformFacade fill:#F3E5F5,stroke:#6A1B9A,stroke-width:2px,color:#000
    style PublicationBuilder fill:#F3E5F5,stroke:#6A1B9A,stroke-width:1.5px,color:#000
```

---

## 5. Diagramme Entité-Relation (ER)

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'fontSize': '14px'}}}%%
erDiagram
    ROLES {
        bigint id PK
        varchar name UK
        text description
    }

    USERS {
        bigint id PK
        varchar email UK
        varchar password_hash
        varchar first_name
        varchar last_name
        varchar avatar_url
        bigint role_id FK
    }

    EVENTS {
        bigint id PK
        varchar title
        text description
        varchar status
        timestamp start_date
        timestamp end_date
        text logo_url
        varchar color_primary
        varchar color_secondary
        text banner_url
        text program_url
        text revue_url
        bigint manager_id FK
    }

    SCREENS {
        bigint id PK
        varchar name
        varchar location
        varchar mode
        varchar resolution
        boolean is_active
        bigint event_id FK
    }

    SCREEN_SECTIONS {
        bigint id PK
        varchar title
        int position
        bigint screen_id FK
        bigint publication_id FK
    }

    PUBLICATIONS {
        bigint id PK
        varchar title
        text abstract_text
        text description
        varchar status
        varchar session
        varchar room
        text poster_url
        int view_count
        text authors_str
        varchar category_str
        bigint event_ref_id FK
        timestamp publish_date
    }

    AUTHORS {
        bigint id PK
        varchar first_name
        varchar last_name
        varchar email
        varchar affiliation
        boolean is_corresponding
    }

    CATEGORIES {
        bigint id PK
        varchar name
        varchar type
        text description
        bigint event_id FK
    }

    PUBLICATION_AUTHORS {
        bigint id PK
        bigint publication_id FK
        bigint author_id FK
        int author_order
    }

    PUBLICATION_CATEGORIES {
        bigint id PK
        bigint publication_id FK
        bigint category_id FK
    }

    MEDIA {
        bigint id PK
        varchar file_path
        varchar file_name
        varchar file_type
        bigint file_size
        varchar thumbnail_path
        int width
        int height
        bigint publication_id FK
    }

    IMPORT_RECORDS {
        bigint id PK
        varchar file_name
        varchar file_type
        int total_rows
        int success_rows
        int failed_rows
        varchar status
        text error_message
        varchar imported_by
        timestamp imported_at
        timestamp completed_at
    }

    AUDIT_LOGS {
        bigint id PK
        varchar username
        varchar entity_type
        bigint entity_id
        varchar action
        text details
    }

    %% Auth
    USERS }o--|| ROLES : "possède (ManyToOne)"

    %% Event
    EVENTS ||--o{ SCREENS : "contient"
    EVENTS ||--o{ PUBLICATIONS : "regroupe"
    EVENTS ||--o{ CATEGORIES : "définit"
    USERS ||--o{ EVENTS : "gère (manager)"

    %% Screen
    SCREENS ||--o{ SCREEN_SECTIONS : "compose"
    SCREEN_SECTIONS }o--|| PUBLICATIONS : "affiche"

    %% Publication
    PUBLICATIONS ||--o{ PUBLICATION_AUTHORS : "via"
    AUTHORS ||--o{ PUBLICATION_AUTHORS : "via"
    PUBLICATIONS ||--o{ PUBLICATION_CATEGORIES : "via"
    CATEGORIES ||--o{ PUBLICATION_CATEGORIES : "via"
    PUBLICATIONS ||--o{ MEDIA : "contient"
```

---

## 6. Cas d'utilisation — Administration Back-Office

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'fontSize': '14px'}}}%%
flowchart LR
    subgraph system["E-Poster Back-Office — Administration"]
        UC_Pub["UC4.1 : Gérer les publications"]
        UC_Import["UC4.2 : Importer en masse"]
        UC_Export["UC4.3 : Exporter"]
        UC_Users["UC3.4 : Gérer les Utilisateurs"]
        UC_Audit["UC3.5 : Consulter l'Audit"]
        UC_Event["UC3.1 : Gérer les Événements"]
        UC_Screen["UC3.2 : Gérer les Écrans"]
        UC_Cat["UC3.3 : Gérer les Catégories"]
        UC_Auth["UC2 : S'authentifier (JWT)"]
    end

    Admin(("Administrateur"))
    Manager(("Gestionnaire\nd'Événement"))

    Admin --> UC_Event
    Admin --> UC_Screen
    Admin --> UC_Cat
    Admin --> UC_Users
    Admin --> UC_Audit
    Admin --> UC_Import
    Manager --> UC_Pub
    Manager --> UC_Export
    Manager -.->|extends| Admin

    UC_Pub -.->|«include»| UC_Auth
    UC_Event -.->|«include»| UC_Auth
    UC_Screen -.->|«include»| UC_Auth
    UC_Cat -.->|«include»| UC_Auth
    UC_Users -.->|«include»| UC_Auth
    UC_Audit -.->|«include»| UC_Auth
    UC_Import -.->|«extend»| UC_Pub
    UC_Export -.->|«extend»| UC_Pub

    style system fill:#FAFAFA,stroke:#333,stroke-width:2px,color:#333
    style Admin fill:#E3F2FD,stroke:#1565C0,stroke-width:2px,color:#000
    style Manager fill:#E3F2FD,stroke:#1565C0,stroke-width:2px,color:#000
    style UC_Auth fill:#FFEBEE,stroke:#B71C1C,stroke-width:1.5px,color:#000
    style UC_Pub fill:#E8F5E9,stroke:#2E7D32,stroke-width:1.5px,color:#000
    style UC_Import fill:#FFF3E0,stroke:#E65100,stroke-width:1.5px,color:#000
    style UC_Export fill:#FFF3E0,stroke:#E65100,stroke-width:1.5px,color:#000
    style UC_Event fill:#E8F5E9,stroke:#2E7D32,stroke-width:1.5px,color:#000
    style UC_Screen fill:#E8F5E9,stroke:#2E7D32,stroke-width:1.5px,color:#000
    style UC_Cat fill:#E8F5E9,stroke:#2E7D32,stroke-width:1.5px,color:#000
    style UC_Users fill:#E8F5E9,stroke:#2E7D32,stroke-width:1.5px,color:#000
    style UC_Audit fill:#E8F5E9,stroke:#2E7D32,stroke-width:1.5px,color:#000
```

---

## 7. Cas d'utilisation — Totem Front-Office

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'fontSize': '14px'}}}%%
flowchart LR
    subgraph system["E-Poster Totem — Front-Office"]
        UC_Consult["UC1 : Consulter les E-Posters"]
        UC_List["UC1.1 : Parcourir la liste paginée"]
        UC_Search["UC1.2 : Rechercher par texte (FULLTEXT)"]
        UC_Filter["UC1.3 : Filtrer par thème/salle/écran"]
        UC_Detail["UC1.4 : Zoomer et voir les PDF/HD"]
    end

    Visiteur(("Visiteur\nTotem"))

    Visiteur --> UC_Consult
    UC_Consult -.->|«include»| UC_List
    UC_Search -.->|«extend»| UC_Consult
    UC_Filter -.->|«extend»| UC_Consult
    UC_Detail -.->|«extend»| UC_Consult

    style system fill:#FAFAFA,stroke:#333,stroke-width:2px,color:#333
    style Visiteur fill:#E3F2FD,stroke:#1565C0,stroke-width:2px,color:#000
    style UC_Consult fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,color:#000
    style UC_List fill:#FFF3E0,stroke:#E65100,stroke-width:1.5px,color:#000
    style UC_Search fill:#FFF3E0,stroke:#E65100,stroke-width:1.5px,color:#000
    style UC_Filter fill:#FFF3E0,stroke:#E65100,stroke-width:1.5px,color:#000
    style UC_Detail fill:#FFF3E0,stroke:#E65100,stroke-width:1.5px,color:#000
```

---

## 8. Diagramme de séquence — Phase 1 : Extraction (Import)

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'fontSize': '13px'}, 'sequence': {'mirrorActors': false}}}}%%
sequenceDiagram
    actor Admin as Administrateur
    participant View as Vue: PublicationsAdmin
    participant Ctrl as Contrôleur: PublicationImportCtrl
    participant Factory as Fabrique: ImportParserFactory
    participant Adapter as Adaptateur: ExcelAdapter
    participant Builder as Concepteur: PublicationBuilder

    Admin->>View: 1. Choisir fichier (.xlsx) & Importer
    View->>Ctrl: 2. POST /api/publications/import (file) [JWT]
    Ctrl->>Factory: 3. createParser("congres.xlsx")
    Factory-->>Ctrl: 4. ExcelAdapter

    Ctrl->>Adapter: 5. parse(file, eventId)

    loop Pour chaque ligne Excel
        Adapter->>Builder: 6. new PublicationBuilder()
        Adapter->>Builder: 7. title().abstractText().posterUrl()
        Adapter->>Builder: 8. authors().category().session()
        Builder-->>Adapter: 9. build() → Publication instance
    end

    Adapter-->>Ctrl: 10. List of Publication
    Ctrl-->>View: 11. HTTP 200 OK (Bilan de l'import)
    View-->>Admin: 12. Afficher le bilan

    style Admin fill:#E3F2FD,stroke:#1565C0,color:#000
    style View fill:#E8EAF6,stroke:#283593,color:#000
    style Ctrl fill:#FCE4EC,stroke:#AD1457,color:#000
    style Factory fill:#F3E5F5,stroke:#6A1B9A,color:#000
    style Adapter fill:#FFF3E0,stroke:#E65100,color:#000
    style Builder fill:#F3E5F5,stroke:#6A1B9A,color:#000
```

---

## 9. Diagramme de séquence — Phase 2 : Persistance & Audit (Import)

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'fontSize': '13px'}, 'sequence': {'mirrorActors': false}}}}%%
sequenceDiagram
    participant Ctrl as Contrôleur: PublicationImportCtrl
    participant Service as Service: PublicationService
    participant Repo as Dépôt: PublicationRepository
    participant Audit as Service: AuditService
    participant DB as Base MySQL

    Ctrl->>Ctrl: 1. Déclenche la persistance de la liste

    loop Pour chaque Publication extraite
        Ctrl->>Service: 2. create(publication)
        Service->>Service: 3. processRelations() (liaison Auteurs/Thèmes)

        Service->>Repo: 4. save(publication)
        Repo->>DB: 5. INSERT INTO publications
        DB-->>Repo: 6. publication (avec ID)
        Repo-->>Service: 7. publication persistée

        Service->>Audit: 8. log("PUBLICATION", id, "CREATE", title)
        Audit->>DB: 9. INSERT INTO audit_logs
        DB-->>Audit: 10. persisté
        Audit-->>Service: 11. OK

        Service-->>Ctrl: 12. OK
    end

    Ctrl->>Ctrl: 13. Fin de la transaction globale

    style Ctrl fill:#FCE4EC,stroke:#AD1457,color:#000
    style Service fill:#E3F2FD,stroke:#1565C0,color:#000
    style Repo fill:#E8F5E9,stroke:#2E7D32,color:#000
    style Audit fill:#FFEBEE,stroke:#B71C1C,color:#000
    style DB fill:#ECEFF1,stroke:#455A64,color:#000
```
