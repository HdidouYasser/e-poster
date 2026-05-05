package com.eposter.backend.publication;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PublicationAuthorRepository extends JpaRepository<PublicationAuthor, Long> {
    List<PublicationAuthor> findByPublicationId(Long publicationId);
    List<PublicationAuthor> findByAuthorId(Long authorId);
    
    @Query("SELECT pa FROM PublicationAuthor pa WHERE pa.publication.id = :pubId ORDER BY pa.authorOrder ASC")
    List<PublicationAuthor> findByPublicationIdOrdered(@Param("pubId") Long publicationId);
    
    void deleteByPublicationId(Long publicationId);
}
