package com.eposter.backend.importer;

import org.springframework.stereotype.Component;

@Component
public class ImportParserFactory {
    private final CsvAdapter csvAdapter;
    private final ExcelAdapter excelAdapter;

    public ImportParserFactory(CsvAdapter csvAdapter, ExcelAdapter excelAdapter) {
        this.csvAdapter = csvAdapter;
        this.excelAdapter = excelAdapter;
    }

    public ImportParser createParser(String filename) {
        String lower = filename == null ? "" : filename.toLowerCase();
        if (lower.endsWith(".xlsx")) return excelAdapter;
        return csvAdapter;
    }
}

