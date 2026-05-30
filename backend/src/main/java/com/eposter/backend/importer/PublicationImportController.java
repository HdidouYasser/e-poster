package com.eposter.backend.importer;

import com.eposter.backend.publication.Publication;
import com.eposter.backend.publication.PublicationService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/import")
public class PublicationImportController {

    private final PublicationService publicationService;
    private final ImportParserFactory parserFactory;
    private final ImportRecordRepository importRecordRepository;

    public PublicationImportController(
            PublicationService publicationService, 
            ImportParserFactory parserFactory,
            ImportRecordRepository importRecordRepository
    ) {
        this.publicationService = publicationService;
        this.parserFactory = parserFactory;
        this.importRecordRepository = importRecordRepository;
    }

    /**
     * Import simple:
     * - XLSX: colonnes (header) => eventId,title,description,status,posterUrl,publishDate(ISO)
     * - CSV: même ordre de colonnes (avec ou sans header)
     */
    @PostMapping(value = "/publications", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ImportResult importPublications(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "eventId", required = false) String defaultEventId
    ) throws Exception {
        String userEmail = "admin";
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            userEmail = auth.getName();
        }

        String originalFilename = file.getOriginalFilename();
        String fileType = originalFilename != null && originalFilename.toLowerCase().endsWith(".csv") ? "CSV" : "EXCEL";

        ImportRecord record = new ImportRecord();
        record.setFileName(originalFilename != null ? originalFilename : "unknown");
        record.setFileType(fileType);
        record.setStatus("PROCESSING");
        record.setImportedBy(userEmail);
        record.setImportedAt(java.time.Instant.now());
        record = importRecordRepository.save(record);

        try {
            ImportParser parser = parserFactory.createParser(originalFilename);
            List<Publication> imported = parser.parse(file, defaultEventId);
            record.setTotalRows(imported.size());

            int created = 0;
            for (Publication p : imported) {
                publicationService.create(p);
                created++;
            }
            record.setSuccessRows(created);
            record.setFailedRows(imported.size() - created);
            record.setStatus("COMPLETED");
            record.setCompletedAt(java.time.Instant.now());
            importRecordRepository.save(record);
            return new ImportResult(created);
        } catch (Exception e) {
            record.setStatus("FAILED");
            record.setErrorMessage(e.getMessage());
            record.setCompletedAt(java.time.Instant.now());
            importRecordRepository.save(record);
            throw e;
        }
    }

    public record ImportResult(int created) {}
}

