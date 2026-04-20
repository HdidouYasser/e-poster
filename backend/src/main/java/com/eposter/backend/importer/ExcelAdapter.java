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
            for (Row row : sheet) {
                if (first) {
                    first = false;
                    String c0 = cellString(row.getCell(0));
                    if ("eventid".equalsIgnoreCase(c0) || "title".equalsIgnoreCase(c0)) continue;
                }
                Publication p = fromColumns(
                        cellString(row.getCell(0)),
                        cellString(row.getCell(1)),
                        cellString(row.getCell(2)),
                        cellString(row.getCell(3)),
                        cellString(row.getCell(4)),
                        cellString(row.getCell(5)),
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

