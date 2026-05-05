package com.eposter.backend.importer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImportRecordRepository extends JpaRepository<ImportRecord, Long> {
    List<ImportRecord> findByStatus(String status);
    List<ImportRecord> findByImportedBy(String importedBy);
    List<ImportRecord> findByFileNameContainingIgnoreCase(String fileName);
}
