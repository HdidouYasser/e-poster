package com.eposter.backend.publication;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.eposter.backend.audit.AuditService;
import com.eposter.backend.category.Category;
import com.eposter.backend.category.CategoryRepository;
import com.eposter.backend.event.Event;
import com.eposter.backend.event.EventRepository;

@Service
public class PublicationService {

    private final PublicationRepository repository;
    private final EventRepository eventRepository;
    private final AuditService auditService;
    private final AuthorRepository authorRepository;
    private final CategoryRepository categoryRepository;

    public PublicationService(PublicationRepository repository, EventRepository eventRepository, AuditService auditService, AuthorRepository authorRepository, CategoryRepository categoryRepository) {
        this.repository = repository;
        this.eventRepository = eventRepository;
        this.auditService = auditService;
        this.authorRepository = authorRepository;
        this.categoryRepository = categoryRepository;
    }

    private String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            return auth.getName();
        }
        return null;
    }

    private boolean isEventManager() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            return auth.getAuthorities().stream()
                    .anyMatch(a -> "ROLE_EVENT_MANAGER".equals(a.getAuthority()));
        }
        return false;
    }

    public Page<Publication> list(Pageable pageable) {
        if (isEventManager()) {
            String email = getCurrentUserEmail();
            if (email != null) {
                return repository.findByEvent_Manager_EmailAndDeletedAtIsNull(email, pageable);
            }
        }
        return repository.findByDeletedAtIsNull(pageable);
    }

    public Page<Publication> listByEventId(String eventId, Pageable pageable) {
        Long id = null;
        try { id = Long.parseLong(eventId); } catch (NumberFormatException e) {}
        if (isEventManager()) {
            String email = getCurrentUserEmail();
            if (email != null) {
                return repository.findByEvent_Manager_EmailAndEvent_IdAndDeletedAtIsNull(email, id, pageable);
            }
        }
        return repository.findByEvent_IdAndDeletedAtIsNull(id, pageable);
    }

    public Page<Publication> search(String query, String eventId, String session, String category, String room, Pageable pageable) {
        Long eventIdLong = null;
        if (eventId != null && !eventId.isBlank()) {
            try { eventIdLong = Long.parseLong(eventId); } catch (NumberFormatException ignored) {}
        }
        
        // Convert camelCase sort fields to snake_case for native SQL query
        java.util.List<org.springframework.data.domain.Sort.Order> orders = new java.util.ArrayList<>();
        for (org.springframework.data.domain.Sort.Order order : pageable.getSort()) {
            String property = order.getProperty();
            if ("createdAt".equals(property)) {
                property = "created_at";
            } else if ("updatedAt".equals(property)) {
                property = "updated_at";
            } else if ("abstractText".equals(property)) {
                property = "abstract_text";
            } else if ("posterUrl".equals(property)) {
                property = "poster_url";
            } else if ("viewCount".equals(property)) {
                property = "view_count";
            }
            orders.add(new org.springframework.data.domain.Sort.Order(order.getDirection(), property));
        }
        Pageable nativePageable = org.springframework.data.domain.PageRequest.of(
            pageable.getPageNumber(), 
            pageable.getPageSize(), 
            org.springframework.data.domain.Sort.by(orders)
        );
        
        String rawQ = (query != null) ? query.trim() : "";
        String formattedQ = "";
        if (query != null && !query.isBlank()) {
            String[] words = query.trim().split("\\s+");
            StringBuilder booleanQuery = new StringBuilder();
            for (String w : words) {
                if (!w.endsWith("*") && !w.startsWith("+") && !w.startsWith("-") && w.length() > 0) {
                    booleanQuery.append("+").append(w).append("* ");
                } else {
                    booleanQuery.append(w).append(" ");
                }
            }
            formattedQ = booleanQuery.toString().trim();
        } else {
            formattedQ = query;
        }

        if (isEventManager()) {
            String email = getCurrentUserEmail();
            if (email != null) {
                return repository.searchFullTextByManager(formattedQ, rawQ, eventIdLong, session, room, category, email, nativePageable);
            }
        }
        return repository.searchFullText(formattedQ, rawQ, eventIdLong, session, room, category, nativePageable);
    }

    public Publication getById(Long id) {
        Publication pub = repository.findByIdAndDeletedAtIsNull(id).orElseThrow(() -> new IllegalArgumentException("Publication not found"));
        if (isEventManager()) {
            String email = getCurrentUserEmail();
            if (email != null && (pub.getEvent() == null || pub.getEvent().getManager() == null || !email.equals(pub.getEvent().getManager().getEmail()))) {
                throw new IllegalArgumentException("Access Denied: You do not manage this publication's event");
            }
        }
        return pub;
    }

    public Publication create(Publication payload) {
        if (isEventManager()) {
            throw new IllegalArgumentException("Access Denied: Event Managers are not allowed to create publications");
        }
        Instant now = Instant.now();
        payload.setId(null);
        payload.setDeletedAt(null);
        payload.setCreatedAt(now);
        payload.setUpdatedAt(now);
        if (payload.getEventId() != null && !payload.getEventId().isBlank()) {
            Long eventId = Long.parseLong(payload.getEventId());
            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new IllegalArgumentException("Event not found"));
            if (isEventManager()) {
                String email = getCurrentUserEmail();
                if (email != null && (event.getManager() == null || !email.equals(event.getManager().getEmail()))) {
                    throw new IllegalArgumentException("Access Denied: You do not manage this event");
                }
            }
            payload.setEvent(event);
        }
        
        processRelations(payload);
        
        if (payload.getMediaList() != null) {
            for (com.eposter.backend.media.Media media : payload.getMediaList()) {
                media.setPublication(payload);
            }
        }
        
        Publication saved = repository.save(payload);
        auditService.log("PUBLICATION", saved.getId(), "CREATE", saved.getTitle());
        return saved;
    }

    public Publication update(Long id, Publication payload) {
        if (isEventManager()) {
            throw new IllegalArgumentException("Access Denied: Event Managers are not allowed to edit publications");
        }
        Publication existing = getById(id); // Performs existing ownership check
        if (payload.getEventId() != null && !payload.getEventId().isBlank()) {
            Long eventId = Long.parseLong(payload.getEventId());
            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new IllegalArgumentException("Event not found"));
            if (isEventManager()) {
                String email = getCurrentUserEmail();
                if (email != null && (event.getManager() == null || !email.equals(event.getManager().getEmail()))) {
                    throw new IllegalArgumentException("Access Denied: You do not manage this event");
                }
            }
            existing.setEvent(event);
        } else {
            existing.setEvent(null);
        }
        existing.setTitle(payload.getTitle());
        existing.setAbstractText(payload.getAbstractText());
        existing.setAuthors(payload.getAuthors());
        existing.setDescription(payload.getDescription());
        existing.setStatus(payload.getStatus());
        existing.setSession(payload.getSession());
        existing.setCategory(payload.getCategory());
        existing.setRoom(payload.getRoom());
        existing.setPosterUrl(payload.getPosterUrl());
        existing.setPublishDate(payload.getPublishDate());
        existing.setUpdatedAt(Instant.now());
        
        existing.setAuthorIds(payload.getAuthorIds());
        existing.setCategoryIds(payload.getCategoryIds());
        processRelations(existing);
        
        if (payload.getMediaList() != null) {
            existing.getMediaList().clear();
            for (com.eposter.backend.media.Media media : payload.getMediaList()) {
                media.setPublication(existing);
                existing.getMediaList().add(media);
            }
        }
        
        Publication saved = repository.save(existing);
        auditService.log("PUBLICATION", saved.getId(), "UPDATE", saved.getTitle());
        return saved;
    }

    
    private void processRelations(Publication publication) {
        // If authors free-text field is filled, extract and save new authors
        if ((publication.getAuthorIds() == null || publication.getAuthorIds().isEmpty()) && 
            publication.getAuthors() != null && !publication.getAuthors().isBlank()) {
            List<Long> extractedAuthorIds = new ArrayList<>();
            String[] authorNames = publication.getAuthors().split(",");
            for (String authorName : authorNames) {
                authorName = authorName.trim();
                if (authorName.isBlank()) continue;

                String[] nameParts = authorName.split("\\s+");
                String firstName = "";
                String lastName = "";
                if (nameParts.length == 1) {
                    lastName = nameParts[0];
                } else if (nameParts.length > 1) {
                    firstName = nameParts[0];
                    StringBuilder sb = new StringBuilder();
                    for (int i = 1; i < nameParts.length; i++) {
                        sb.append(nameParts[i]).append(" ");
                    }
                    lastName = sb.toString().trim();
                }

                String finalFirst = firstName;
                String finalLast = lastName;
                Author author = authorRepository.findByFirstNameIgnoreCaseAndLastNameIgnoreCase(firstName, lastName)
                        .orElseGet(() -> {
                            Author newAuthor = new Author();
                            newAuthor.setFirstName(finalFirst);
                            newAuthor.setLastName(finalLast);
                            newAuthor.setCreatedAt(Instant.now());
                            return authorRepository.save(newAuthor);
                        });
                extractedAuthorIds.add(author.getId());
            }
            publication.setAuthorIds(extractedAuthorIds);
        }

        if (publication.getAuthorIds() != null) {
            publication.getPublicationAuthors().clear();
            List<String> authorNames = new ArrayList<>();
            int order = 0;
            for (Long authorId : publication.getAuthorIds()) {
                Author author = authorRepository.findById(authorId).orElse(null);
                if (author != null) {
                    PublicationAuthor pa = new PublicationAuthor();
                    pa.setPublication(publication);
                    pa.setAuthor(author);
                    pa.setAuthorOrder(order++);
                    publication.getPublicationAuthors().add(pa);
                    authorNames.add(author.getFirstName() + " " + author.getLastName());
                }
            }
            if (!authorNames.isEmpty() && (publication.getAuthors() == null || publication.getAuthors().isBlank())) {
                publication.setAuthors(String.join(", ", authorNames));
            }
        }
        
        // If category free-text field is filled, extract and save new categories
        if ((publication.getCategoryIds() == null || publication.getCategoryIds().isEmpty()) && 
            publication.getCategory() != null && !publication.getCategory().isBlank()) {
            List<Long> extractedCategoryIds = new ArrayList<>();
            String[] catNames = publication.getCategory().split(",");
            for (String catName : catNames) {
                catName = catName.trim();
                if (catName.isBlank()) continue;

                String finalCatName = catName;
                Category category = categoryRepository.findByNameIgnoreCaseAndDeletedAtIsNull(catName)
                        .orElseGet(() -> {
                            Category newCat = new Category();
                            newCat.setName(finalCatName);
                            newCat.setType("THEME");
                            newCat.setEvent(publication.getEvent());
                            newCat.setCreatedAt(Instant.now());
                            return categoryRepository.save(newCat);
                        });
                extractedCategoryIds.add(category.getId());
            }
            publication.setCategoryIds(extractedCategoryIds);
        }

        if (publication.getCategoryIds() != null) {
            publication.getPublicationCategories().clear();
            List<String> categoryNames = new ArrayList<>();
            for (Long categoryId : publication.getCategoryIds()) {
                Category category = categoryRepository.findByIdAndDeletedAtIsNull(categoryId).orElse(null);
                if (category != null) {
                    PublicationCategory pc = new PublicationCategory();
                    pc.setPublication(publication);
                    pc.setCategory(category);
                    publication.getPublicationCategories().add(pc);
                    categoryNames.add(category.getName());
                }
            }
            if (!categoryNames.isEmpty() && (publication.getCategory() == null || publication.getCategory().isBlank())) {
                publication.setCategory(String.join(", ", categoryNames));
            }
        }
    }

    public void delete(Long id) {
        if (isEventManager()) {
            throw new IllegalArgumentException("Access Denied: Event Managers are not allowed to delete publications");
        }
        Publication existing = getById(id);
        repository.delete(existing);
        auditService.log("PUBLICATION", id, "DELETE", existing.getTitle());
    }

    public byte[] exportPublicationsCSV() {
        List<Publication> publications = repository.findAll();
        StringBuilder csv = new StringBuilder();
        
        // Headers  
        csv.append("ID,Titre,Auteurs,Événement,Statut,Créé le,Vues\n");
        
        // Data rows
        publications.forEach(pub -> {
            csv.append(escapeCSV(pub.getId().toString())).append(",")
               .append(escapeCSV(pub.getTitle())).append(",")
               .append(escapeCSV(pub.getAuthors() != null ? pub.getAuthors() : "")).append(",")
               .append(escapeCSV(pub.getEvent() != null ? pub.getEvent().getTitle() : "")).append(",")
               .append(escapeCSV(pub.getStatus() != null ? pub.getStatus() : "")).append(",")
               .append(escapeCSV(pub.getCreatedAt() != null ? pub.getCreatedAt().toString() : "")).append(",")
               .append(pub.getViewCount() != null ? pub.getViewCount() : 0).append("\n");
        });
        
        return csv.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }

    private String escapeCSV(String value) {
        if (value == null) {
            return "";
        }
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }

    public Publication getAndIncrementViewCount(Long id) {
        Publication pub = getById(id);
        pub.setViewCount(pub.getViewCount() + 1);
        return repository.save(pub);
    }

    public long getTotalViews() {
        return repository.sumViewCount();
    }

    public List<Publication> getTopViewed() {
        return repository.findTop5ByDeletedAtIsNullOrderByViewCountDesc();
    }

    public byte[] exportPublicationsJSON() {
        List<Publication> publications = repository.findAll();
        java.util.List<java.util.Map<String, Object>> data = new java.util.ArrayList<>();
        
        for (Publication pub : publications) {
            java.util.Map<String, Object> map = new java.util.LinkedHashMap<>();
            map.put("id", pub.getId());
            map.put("title", pub.getTitle());
            map.put("authors", pub.getAuthors());
            map.put("event", pub.getEvent() != null ? pub.getEvent().getTitle() : null);
            map.put("status", pub.getStatus());
            map.put("createdAt", pub.getCreatedAt() != null ? pub.getCreatedAt().toString() : null);
            map.put("views", pub.getViewCount() != null ? pub.getViewCount() : 0);
            data.add(map);
        }
        
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        try {
            return mapper.writerWithDefaultPrettyPrinter()
                .writeValueAsBytes(data);
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            throw new RuntimeException("Failed to export JSON: " + e.getMessage());
        }
    }

    public byte[] exportPublicationsPDF() {
        List<Publication> publications = repository.findAll();
        try (org.apache.pdfbox.pdmodel.PDDocument document = new org.apache.pdfbox.pdmodel.PDDocument()) {
            org.apache.pdfbox.pdmodel.PDPage page = new org.apache.pdfbox.pdmodel.PDPage();
            document.addPage(page);
            
            try (org.apache.pdfbox.pdmodel.PDPageContentStream contentStream = new org.apache.pdfbox.pdmodel.PDPageContentStream(document, page)) {
                contentStream.beginText();
                contentStream.setFont(org.apache.pdfbox.pdmodel.font.PDType1Font.HELVETICA_BOLD, 16);
                contentStream.newLineAtOffset(50, 750);
                contentStream.showText("Liste des E-Posters");
                contentStream.endText();
                
                contentStream.beginText();
                contentStream.setFont(org.apache.pdfbox.pdmodel.font.PDType1Font.HELVETICA, 10);
                contentStream.newLineAtOffset(50, 720);
                
                int y = 720;
                for (Publication pub : publications) {
                    if (y < 50) {
                        break;
                    }
                    String line = String.format("ID: %d | Title: %s | Authors: %s | Event: %s", 
                        pub.getId(), 
                        pub.getTitle().substring(0, Math.min(pub.getTitle().length(), 40)),
                        pub.getAuthors() != null ? pub.getAuthors().substring(0, Math.min(pub.getAuthors().length(), 20)) : "",
                        pub.getEvent() != null ? pub.getEvent().getTitle().substring(0, Math.min(pub.getEvent().getTitle().length(), 20)) : ""
                    );
                    contentStream.showText(safePdfString(line));
                    contentStream.newLineAtOffset(0, -15);
                    y -= 15;
                }
                contentStream.endText();
            }
            
            java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream();
            document.save(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }

    private String safePdfString(String str) {
        if (str == null) return "";
        return str.replace("é", "e").replace("è", "e").replace("ê", "e")
                  .replace("à", "a").replace("â", "a")
                  .replace("ù", "u").replace("û", "u")
                  .replace("î", "i").replace("ï", "i")
                  .replace("ô", "o")
                  .replace("ç", "c")
                  .replaceAll("[^\\x20-\\x7E]", ""); // strip anything else not in standard printable ASCII range
    }
}

