# E-Poster Platform - Enhanced Data Model

## Overview
This document describes the enhanced data model for the E-Poster platform, addressing the supervisor's feedback and implementing a production-ready database schema.

## Key Improvements

### 1. **Normalized Data Model**
- **Authors**: Separated from Publication into dedicated entity with full details
- **Junction Tables**: Explicit many-to-many relationships via PublicationAuthor and PublicationCategory
- **Foreign Keys**: All relationships properly defined with @JoinColumn annotations

### 2. **Enhanced Entity Structure**

#### Core Entities
- **User**: Added firstName, lastName, timestamps, soft delete
- **Role**: Added description, timestamps
- **Event**: Complete with dates, location, timestamps, soft delete
- **Screen**: Enhanced with resolution, isActive flag, better multi-screen support
- **Category**: Added description, timestamps, soft delete

#### Publication Ecosystem
- **Publication**: Removed denormalized fields (authors, category strings), added abstractText
- **Author**: New entity with firstName, lastName, email, affiliation, isCorresponding
- **PublicationAuthor**: Junction table with authorOrder for ordering
- **PublicationCategory**: Junction table for publication-category relationships

#### Media Management
- **Media**: Enhanced with fileName, fileType, fileSize, thumbnailPath, dimensions
- **FileEntity**: Separate entity for file storage tracking

#### Import System
- **ImportRecord**: Tracks CSV/Excel imports with success/failure metrics
- **ImportParser**: Interface for parsing strategies
- **CsvAdapter/ExcelAdapter**: Adapter pattern implementations

### 3. **Design Patterns Implementation**

#### Business Models (Domain Layer)
- User, Role, Event, Screen, Publication, Author, Category, Media
- ScreenSection, FileEntity, ImportRecord, AuditLog

#### Technical Patterns (Infrastructure Layer)
- **Facade**: PlatformFacade - orchestrates multiple services
- **Builder**: PublicationBuilder - constructs Publication entities
- **Factory Method**: ImportParserFactory - creates parsers
- **Adapter**: CsvAdapter, ExcelAdapter - adapts file formats
- **Composite**: ScreenComponent - screen/section hierarchy

### 4. **Audit & Timestamps**
All entities include:
- `createdAt`: Record creation timestamp
- `updatedAt`: Last modification timestamp (where applicable)
- `deletedAt`: Soft delete timestamp (null = active)

### 5. **Database Indexes**
Strategic indexes for performance:
- `idx_publications_event_id`: Event-based queries
- `idx_publications_status`: Status filtering
- Unique constraints on junction tables

## Entity Relationships

### Authentication
```
User (*) -- (*) Role
```

### Event Management
```
Event (1) -- (*) Screen
Event (1) -- (*) Publication
Event (1) -- (*) Category
```

### Publication (Normalized)
```
Publication (*) -- (*) Author (via PublicationAuthor)
Publication (*) -- (*) Category (via PublicationCategory)
Publication (1) -- (*) Media
```

### Screen Hierarchy (Composite Pattern)
```
Screen (1) -- (*) ScreenSection
ScreenSection (*) -- (*) Publication
```

## Migration Notes

### Breaking Changes
1. `Publication.authors` (String) → `PublicationAuthors` (entity)
2. `Publication.category` (String) → `PublicationCategories` (entity)
3. `Publication.eventId` (String) → `Publication.event` (Long FK)
4. `Category.publications` → `Category.publicationCategories`

### Data Migration Required
- Migrate author strings to Author entities
- Create PublicationAuthor junction records
- Migrate category strings to Category entities
- Create PublicationCategory junction records

## Next Steps
1. Create database migration scripts
2. Update service layer to use new relationships
3. Update controllers and DTOs
4. Update frontend API calls
5. Test all CRUD operations
