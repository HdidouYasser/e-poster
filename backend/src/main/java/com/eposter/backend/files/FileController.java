package com.eposter.backend.files;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final FileRepository fileRepository;

    @Value("${app.files.storage-dir:uploads}")
    private String storageDir;

    public FileController(FileRepository fileRepository) {
        this.fileRepository = fileRepository;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UploadResponse upload(@RequestParam("file") MultipartFile file) throws Exception {
        String originalName = StringUtils.hasText(file.getOriginalFilename()) ? file.getOriginalFilename() : "upload";
        String safeExt = "";
        int dot = originalName.lastIndexOf('.');
        if (dot >= 0 && dot < originalName.length() - 1) safeExt = "." + originalName.substring(dot + 1);
        String storageName = UUID.randomUUID() + safeExt;

        Path dir = Path.of(storageDir);
        Files.createDirectories(dir);
        Path target = dir.resolve(storageName);
        file.transferTo(target);

        FileEntity entity = new FileEntity();
        entity.setOriginalName(originalName);
        entity.setContentType(file.getContentType());
        entity.setStoragePath(target.toAbsolutePath().toString());
        entity.setSizeBytes(file.getSize());
        entity.setCreatedAt(Instant.now());
        FileEntity saved = fileRepository.save(entity);

        return new UploadResponse(String.valueOf(saved.getId()), "/api/files/" + saved.getId());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> download(@PathVariable Long id) throws IOException {
        FileEntity file = fileRepository.findById(id).orElse(null);
        if (file == null) return ResponseEntity.notFound().build();

        Path p = Path.of(file.getStoragePath());
        if (!Files.exists(p)) return ResponseEntity.notFound().build();

        String contentType = StringUtils.hasText(file.getContentType()) ? file.getContentType() : Files.probeContentType(p);
        if (!StringUtils.hasText(contentType)) contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getOriginalName() + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(Files.readAllBytes(p));
    }

    public record UploadResponse(String id, String url) {}
}

