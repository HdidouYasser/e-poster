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
            while ((line = br.readLine()) != null) {
                if (line.isBlank()) continue;
                String[] cols = line.split(";", -1);
                if (cols.length == 1) cols = line.split(",", -1);
                if (first) {
                    first = false;
                    String c0 = cols.length > 0 ? cols[0].trim() : "";
                    if ("eventid".equalsIgnoreCase(c0) || "title".equalsIgnoreCase(c0)) continue;
                }
                Publication p = fromColumns(
                        col(cols, 0),
                        col(cols, 1),
                        col(cols, 2),
                        col(cols, 3),
                        col(cols, 4),
                        col(cols, 5),
                        defaultEventId
                );
                if (p != null) out.add(p);
            }
            return out;
        }
    }

    private Publication fromColumns(
            String eventId,
            String title,
            String description,
            String status,
            String posterUrl,
            String publishDateIso,
            String defaultEventId
    ) {
        if ((title == null || title.isBlank()) && (description == null || description.isBlank())) return null;
        PublicationBuilder builder = new PublicationBuilder()
                .eventId((eventId == null || eventId.isBlank()) ? defaultEventId : eventId)
                .title(title == null ? "" : title)
                .description(description)
                .status(status == null || status.isBlank() ? "DRAFT" : status)
                .posterUrl(posterUrl);
        if (publishDateIso != null && !publishDateIso.isBlank()) {
            try {
                builder.publishDate(Instant.parse(publishDateIso.trim()));
            } catch (Exception ignored) {
                // ignore invalid date
            }
        }
        return builder.build();
    }

    private static String col(String[] cols, int idx) {
        return idx < cols.length ? cols[idx].trim() : "";
    }
}

