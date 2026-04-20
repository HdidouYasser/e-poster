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

    public PublicationImportController(PublicationService publicationService, ImportParserFactory parserFactory) {
        this.publicationService = publicationService;
        this.parserFactory = parserFactory;
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
        ImportParser parser = parserFactory.createParser(file.getOriginalFilename());
        List<Publication> imported = parser.parse(file, defaultEventId);

        int created = 0;
        for (Publication p : imported) {
            publicationService.create(p);
            created++;
        }
        return new ImportResult(created);
    }

    public record ImportResult(int created) {}
}

