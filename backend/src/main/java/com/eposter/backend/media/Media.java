package com.eposter.backend.media;

import com.eposter.backend.publication.Publication;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Column;

import java.time.Instant;

@Entity
@Table(name = "media")
public class Media {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "file_path", nullable = false)
    private String filePath;
    
    @Column(name = "file_name")
    private String fileName;
    
    @Column(name = "file_type")
    private String fileType; // POSTER, THUMBNAIL, IMAGE, VIDEO, etc.
    
    @Column(name = "file_size")
    private Long fileSize;
    
    @Column(name = "thumbnail_path")
    private String thumbnailPath;
    
    private Integer width;
    private Integer height;
    
    @JsonIgnore
    @ManyToOne
    private Publication publication;
    
    @Column(name = "upload_date")
    private Instant uploadDate;
    
    @Column(name = "created_at")
    private Instant createdAt;
    
    @Column(name = "deleted_at")
    private Instant deletedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }
    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    public String getThumbnailPath() { return thumbnailPath; }
    public void setThumbnailPath(String thumbnailPath) { this.thumbnailPath = thumbnailPath; }
    public Integer getWidth() { return width; }
    public void setWidth(Integer width) { this.width = width; }
    public Integer getHeight() { return height; }
    public void setHeight(Integer height) { this.height = height; }
    public Publication getPublication() { return publication; }
    public void setPublication(Publication publication) { this.publication = publication; }
    public Instant getUploadDate() { return uploadDate; }
    public void setUploadDate(Instant uploadDate) { this.uploadDate = uploadDate; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getDeletedAt() { return deletedAt; }
    public void setDeletedAt(Instant deletedAt) { this.deletedAt = deletedAt; }
}

