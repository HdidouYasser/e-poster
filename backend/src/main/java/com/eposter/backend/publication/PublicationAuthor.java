package com.eposter.backend.publication;

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
@Table(name = "publication_authors", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"publication_id", "author_id"}))
public class PublicationAuthor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "publication_id", nullable = false)
    private Publication publication;
    
    @ManyToOne
    @JoinColumn(name = "author_id", nullable = false)
    private Author author;
    
    @Column(name = "author_order")
    private Integer authorOrder;
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Publication getPublication() { return publication; }
    public void setPublication(Publication publication) { this.publication = publication; }
    public Author getAuthor() { return author; }
    public void setAuthor(Author author) { this.author = author; }
    public Integer getAuthorOrder() { return authorOrder; }
    public void setAuthorOrder(Integer authorOrder) { this.authorOrder = authorOrder; }
}
