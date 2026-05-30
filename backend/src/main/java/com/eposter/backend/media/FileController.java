package com.eposter.backend.media;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.awt.image.BufferedImage;
import javax.imageio.ImageIO;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final Path storageRoot;

    public FileController(@Value("${app.files.storage-dir:uploads}") String storageDir) throws IOException {
        this.storageRoot = Paths.get(storageDir).toAbsolutePath().normalize();
        Files.createDirectories(this.storageRoot);
    }

    /**
     * POST /api/files — Upload un fichier (image, PDF…).
     * Protégé par JWT (anyRequest().authenticated() dans SecurityConfig).
     * Retourne { "url": "/api/files/{filename}" }
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> upload(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Fichier vide"));
        }

        String originalName = file.getOriginalFilename() != null
                ? file.getOriginalFilename().replaceAll("[^a-zA-Z0-9._-]", "_")
                : "file";
        String extension = originalName.contains(".")
                ? originalName.substring(originalName.lastIndexOf('.'))
                : "";
        String storedName = UUID.randomUUID() + extension;

        Path target = storageRoot.resolve(storedName).normalize();
        if (!target.startsWith(storageRoot)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Chemin invalide"));
        }

        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        Map<String, String> response = new HashMap<>();
        response.put("url", "/api/files/" + storedName);

        // Generate thumbnail if it's a PDF
        if (originalName.toLowerCase().endsWith(".pdf")) {
            try (PDDocument document = PDDocument.load(target.toFile())) {
                PDFRenderer pdfRenderer = new PDFRenderer(document);
                BufferedImage bim = pdfRenderer.renderImageWithDPI(0, 150);
                String thumbName = "thumb_" + storedName.replace(".pdf", ".jpg");
                Path thumbTarget = storageRoot.resolve(thumbName).normalize();
                ImageIO.write(bim, "jpg", thumbTarget.toFile());
                response.put("thumbnailUrl", "/api/files/" + thumbName);
            } catch (Exception e) {
                // Ignore PDF parsing errors, just proceed without thumbnail
                e.printStackTrace();
            }
        }

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/files/{filename} — Sert le fichier stocké.
     * Autorisé sans token (permitAll dans SecurityConfig).
     */
    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> serve(@PathVariable String filename) throws MalformedURLException {
        Path filePath = storageRoot.resolve(filename).normalize();
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            return ResponseEntity.notFound().build();
        }

        String contentType;
        try {
            contentType = Files.probeContentType(filePath);
        } catch (IOException e) {
            contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }
        if (contentType == null) contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(resource);
    }
}
