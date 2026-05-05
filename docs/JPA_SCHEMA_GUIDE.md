# JPA Schema Generation - No SQL Needed!

## ✅ You're Using JPA/Hibernate

Since your project uses **Spring Data JPA**, you **don't need** to write SQL schemas manually. JPA will automatically create the database from your entity annotations!

---

## 📋 How It Works

### 1. Entity Annotations = Database Schema

Your Java entities with JPA annotations define the database structure:

```java
@Entity
@Table(name = "publications")
public class Publication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @ManyToOne
    @JoinColumn(name = "event_ref_id")
    private Event event;
    
    @OneToMany(mappedBy = "publication", cascade = CascadeType.ALL)
    private List<PublicationAuthor> publicationAuthors;
}
```

**JPA automatically creates:**
- Table: `publications`
- Columns: `id`, `title`, `event_ref_id`
- Primary Key: `id`
- Foreign Key: `event_ref_id` → `events(id)`
- NOT NULL constraint on `title`

---

## 🔧 Configuration

In your `application.yml`, you have:

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: update  # Auto-creates/updates tables
    show-sql: true      # Shows SQL queries in console
```

### DDL Auto Options:
- `update`: Creates/updates tables (for development) ✅ **You're using this**
- `create`: Drops and recreates tables (for testing)
- `create-drop`: Creates tables, drops on shutdown (for testing)
- `validate`: Validates schema, doesn't modify (for production)
- `none`: No action (for production with manual migrations)

---

## 📊 What JPA Creates Automatically

### From Your Entities:

| Entity | Table Created | Foreign Keys | Indexes |
|--------|--------------|--------------|---------|
| User | `users` | role_id → roles | - |
| Role | `roles` | - | - |
| Event | `events` | - | - |
| Screen | `screens` | event_id → events | - |
| Publication | `publications` | event_ref_id → events | idx_publications_event_id, idx_publications_status |
| Author | `authors` | - | - |
| PublicationAuthor | `publication_authors` | publication_id, author_id | UNIQUE(publication_id, author_id) |
| Category | `categories` | event_id → events | - |
| PublicationCategory | `publication_categories` | publication_id, category_id | UNIQUE(publication_id, category_id) |
| Media | `media` | publication_id → publications | - |
| ImportRecord | `import_records` | - | - |
| AuditLog | `audit_logs` | - | - |

---

## 🎯 Key JPA Annotations Used

### Entity Definition
```java
@Entity           // Marks as JPA entity
@Table(name = "x") // Specifies table name
```

### Primary Key
```java
@Id                    // Primary key
@GeneratedValue(...)   // Auto-increment
```

### Columns
```java
@Column(name = "x")        // Column name
@Column(nullable = false)  // NOT NULL constraint
@Column(unique = true)     // UNIQUE constraint
```

### Relationships
```java
@ManyToOne                 // Many-to-One relationship
@JoinColumn(name = "x")    // Foreign key column

@OneToMany(mappedBy = "x") // One-to-Many (inverse side)

@ManyToMany               // Many-to-Many (rarely used directly)
```

### Cascade Operations
```java
@OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
// Cascade: save/update/delete children automatically
// orphanRemoval: delete children when removed from parent
```

---

## 🚀 How to Use

### 1. Just Run Your Application
```bash
cd e-poster/backend
mvn spring-boot:run
```

JPA will:
- ✅ Create all tables automatically
- ✅ Create foreign keys
- ✅ Create indexes you defined
- ✅ Update schema when you add/modify entities

### 2. Check the Generated Schema

**Option 1: Enable SQL logging**
```yaml
spring:
  jpa:
    show-sql: true
    properties:
      hibernate:
        format_sql: true
```

**Option 2: Check database directly**
```sql
SHOW TABLES;
DESCRIBE publications;
```

---

## ⚠️ Important Notes

### For Development (Current)
```yaml
ddl-auto: update
```
- ✅ Convenient for development
- ✅ Automatically adds new columns/tables
- ⚠️ Doesn't delete old columns
- ⚠️ Can't handle complex migrations

### For Production (Later)
```yaml
ddl-auto: none  # or validate
```
Use **Flyway** or **Liquibase** for:
- Version-controlled migrations
- Rolling back changes
- Production-safe schema updates

---

## 📝 Example: What Happens When You Run

When you start your app, Hibernate generates SQL like:

```sql
CREATE TABLE publications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    abstract_text TEXT,
    description TEXT,
    status VARCHAR(50),
    session VARCHAR(100),
    room VARCHAR(100),
    poster_url VARCHAR(500),
    event_ref_id BIGINT,
    publish_date TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (event_ref_id) REFERENCES events(id)
);

CREATE INDEX idx_publications_event_id ON publications(event_ref_id);
CREATE INDEX idx_publications_status ON publications(status);

CREATE TABLE publication_authors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    publication_id BIGINT NOT NULL,
    author_id BIGINT NOT NULL,
    author_order INT,
    UNIQUE (publication_id, author_id),
    FOREIGN KEY (publication_id) REFERENCES publications(id),
    FOREIGN KEY (author_id) REFERENCES authors(id)
);
```

**But you never write this SQL!** JPA does it for you from your annotations.

---

## 🎓 Summary

| What | How |
|------|-----|
| **Schema Creation** | JPA annotations on entities |
| **Foreign Keys** | `@JoinColumn` annotations |
| **Indexes** | `@Index` in `@Table` |
| **Constraints** | `@Column(nullable=...)`, `unique=...` |
| **Relationships** | `@ManyToOne`, `@OneToMany`, etc. |
| **No SQL Needed!** | Just Java code ✅ |

---

## 📚 Your PlantUML Diagrams

You now have **two versions**:

1. **`enhanced-class-diagram.puml`**: Complete with all attributes (for detailed documentation)
2. **`simple-class-diagram.puml`**: Simplified, easier to read (for presentations)

Both accurately reflect your JPA entities and can be shown to your supervisor!

---

## ✨ Bottom Line

**You're doing it right!** 
- ✅ JPA entities define your schema
- ✅ No manual SQL needed
- ✅ Annotations create tables, FKs, indexes automatically
- ✅ Just run the app and Hibernate does the rest

The diagrams are for **documentation and understanding**, but the **actual database** comes from your Java entities with JPA annotations.
