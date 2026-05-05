package com.eposter.backend.publication;

import com.eposter.backend.category.Category;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "publication_categories",
       uniqueConstraints = @UniqueConstraint(columnNames = {"publication_id", "category_id"}))
public class PublicationCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "publication_id", nullable = false)
    private Publication publication;
    
    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Publication getPublication() { return publication; }
    public void setPublication(Publication publication) { this.publication = publication; }
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
}
