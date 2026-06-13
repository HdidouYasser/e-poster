package com.eposter.backend.importer;

import com.eposter.backend.publication.Publication;
import com.eposter.backend.publication.PublicationBuilder;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Component
public class CsvAdapter implements ImportParser {
    @Override
    public List<Publication> parse(MultipartFile file, String defaultEventId) throws Exception {
        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            List<Publication> out = new ArrayList<>();
            String line;
            boolean first = true;
            
            // Positional fallback indices
            int titleIdx = 1;
            int authorsIdx = -1;
            int abstractIdx = 2;
            int statusIdx = 3;
            int posterUrlIdx = 4;
            int publishDateIdx = 5;
            int eventIdIdx = 0;

            while ((line = br.readLine()) != null) {
                if (line.isBlank()) continue;
                String[] cols = line.split(";", -1);
                if (cols.length == 1) cols = line.split(",", -1);
                
                if (first) {
                    first = false;
                    boolean hasHeaders = false;
                    for (int i = 0; i < cols.length; i++) {
                        String colVal = cols[i].toLowerCase().trim();
                        if (colVal.contains("title") || colVal.contains("titre") || 
                            colVal.contains("author") || colVal.contains("auteur") || 
                            colVal.contains("abstract") || colVal.contains("resume")) {
                            hasHeaders = true;
                            break;
                        }
                    }
                    if (hasHeaders) {
                        titleIdx = -1; authorsIdx = -1; abstractIdx = -1; statusIdx = -1; 
                        posterUrlIdx = -1; publishDateIdx = -1; eventIdIdx = -1;
                        for (int i = 0; i < cols.length; i++) {
                            String header = cols[i].toLowerCase().trim();
                            if (header.equals("title") || header.equals("titre")) titleIdx = i;
                            else if (header.equals("authors") || header.equals("auteurs") || header.equals("author") || header.equals("auteur")) authorsIdx = i;
                            else if (header.equals("abstract") || header.equals("resume") || header.equals("abstracttext")) abstractIdx = i;
                            else if (header.equals("description")) { if (abstractIdx == -1) abstractIdx = i; }
                            else if (header.equals("status") || header.equals("statut")) statusIdx = i;
                            else if (header.equals("posterurl") || header.equals("poster") || header.equals("image")) posterUrlIdx = i;
                            else if (header.equals("publishdate") || header.equals("date")) publishDateIdx = i;
                            else if (header.equals("eventid") || header.equals("event") || header.equals("evenement")) eventIdIdx = i;
                        }
                        continue; // Skip processing header line
                    }
                }

                String title = titleIdx != -1 ? col(cols, titleIdx) : "";
                String authors = authorsIdx != -1 ? col(cols, authorsIdx) : "";
                String abstractText = abstractIdx != -1 ? col(cols, abstractIdx) : "";
                String status = statusIdx != -1 ? col(cols, statusIdx) : "DRAFT";
                String posterUrl = posterUrlIdx != -1 ? col(cols, posterUrlIdx) : "";
                String publishDateIso = publishDateIdx != -1 ? col(cols, publishDateIdx) : "";
                String eventId = eventIdIdx != -1 ? col(cols, eventIdIdx) : "";

                if (title.isBlank() && abstractText.isBlank()) continue;

                PublicationBuilder builder = new PublicationBuilder()
                        .eventId(eventId.isBlank() ? defaultEventId : eventId)
                        .title(title)
                        .authors(authors)
                        .description(abstractText)
                        .abstractText(abstractText)
                        .status(status.isBlank() ? "DRAFT" : status)
                        .posterUrl(posterUrl);

                if (!publishDateIso.isBlank()) {
                    try {
                        builder.publishDate(Instant.parse(publishDateIso.trim()));
                    } catch (Exception ignored) {
                        // ignore invalid date
                    }
                }
                out.add(builder.build());
            }
            return out;
        }
    }

    private static String col(String[] cols, int idx) {
        return idx < cols.length ? cols[idx].trim() : "";
    }
}
