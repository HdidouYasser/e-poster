package com.eposter.backend.importer;

import com.eposter.backend.publication.Publication;
import com.eposter.backend.publication.PublicationBuilder;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Component
public class ExcelAdapter implements ImportParser {
    @Override
    public List<Publication> parse(MultipartFile file, String defaultEventId) throws Exception {
        try (XSSFWorkbook wb = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = wb.getNumberOfSheets() > 0 ? wb.getSheetAt(0) : null;
            if (sheet == null) return List.of();

            List<Publication> out = new ArrayList<>();
            boolean first = true;
            
            // Positional fallback indices if no headers match
            int titleIdx = 1;
            int authorsIdx = -1;
            int abstractIdx = 2;
            int statusIdx = 3;
            int posterUrlIdx = 4;
            int publishDateIdx = 5;
            int eventIdIdx = 0;

            for (Row row : sheet) {
                if (first) {
                    first = false;
                    boolean hasHeaders = false;
                    for (int i = 0; i < row.getLastCellNum(); i++) {
                        String cellVal = cellString(row.getCell(i)).toLowerCase();
                        if (cellVal.contains("title") || cellVal.contains("titre") || 
                            cellVal.contains("author") || cellVal.contains("auteur") || 
                            cellVal.contains("abstract") || cellVal.contains("resume")) {
                            hasHeaders = true;
                            break;
                        }
                    }
                    if (hasHeaders) {
                        titleIdx = -1; authorsIdx = -1; abstractIdx = -1; statusIdx = -1; 
                        posterUrlIdx = -1; publishDateIdx = -1; eventIdIdx = -1;
                        for (int i = 0; i < row.getLastCellNum(); i++) {
                            String header = cellString(row.getCell(i)).toLowerCase().trim();
                            if (header.equals("title") || header.equals("titre")) titleIdx = i;
                            else if (header.equals("authors") || header.equals("auteurs") || header.equals("author") || header.equals("auteur")) authorsIdx = i;
                            else if (header.equals("abstract") || header.equals("resume") || header.equals("abstracttext")) abstractIdx = i;
                            else if (header.equals("description")) { if (abstractIdx == -1) abstractIdx = i; }
                            else if (header.equals("status") || header.equals("statut")) statusIdx = i;
                            else if (header.equals("posterurl") || header.equals("poster") || header.equals("image")) posterUrlIdx = i;
                            else if (header.equals("publishdate") || header.equals("date")) publishDateIdx = i;
                            else if (header.equals("eventid") || header.equals("event") || header.equals("evenement")) eventIdIdx = i;
                        }
                        continue; // Skip processing header row
                    }
                }

                String title = titleIdx != -1 ? cellString(row.getCell(titleIdx)) : "";
                String authors = authorsIdx != -1 ? cellString(row.getCell(authorsIdx)) : "";
                String abstractText = abstractIdx != -1 ? cellString(row.getCell(abstractIdx)) : "";
                String status = statusIdx != -1 ? cellString(row.getCell(statusIdx)) : "DRAFT";
                String posterUrl = posterUrlIdx != -1 ? cellString(row.getCell(posterUrlIdx)) : "";
                String publishDateIso = publishDateIdx != -1 ? cellString(row.getCell(publishDateIdx)) : "";
                String eventId = eventIdIdx != -1 ? cellString(row.getCell(eventIdIdx)) : "";

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
                Publication pub = builder.build();
                out.add(pub);
            }
            return out;
        }
    }

    private static String cellString(Cell cell) {
        if (cell == null) return "";
        String value = switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> String.valueOf(cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> "";
        };
        return value.trim();
    }
}
