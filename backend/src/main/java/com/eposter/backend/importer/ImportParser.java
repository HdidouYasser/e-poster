package com.eposter.backend.importer;

import com.eposter.backend.publication.Publication;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ImportParser {
    List<Publication> parse(MultipartFile file, String defaultEventId) throws Exception;
}

