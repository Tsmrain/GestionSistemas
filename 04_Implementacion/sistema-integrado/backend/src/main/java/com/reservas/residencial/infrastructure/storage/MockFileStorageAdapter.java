package com.reservas.residencial.infrastructure.storage;

import com.reservas.residencial.application.ports.out.FileStoragePort;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class MockFileStorageAdapter implements FileStoragePort {

    private final Path uploadPath;

    public MockFileStorageAdapter(@Value("${app.upload.dir:uploads}") String uploadDir) {
        this.uploadPath = Paths.get(uploadDir, "carnets").toAbsolutePath().normalize();
    }

    @Override
    public String guardar(MultipartFile file) {
        try {
            Files.createDirectories(uploadPath);
            String originalFilename = file.getOriginalFilename() == null ? "archivo" : file.getOriginalFilename();
            String safeFilename = originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
            String filename = UUID.randomUUID() + "_" + safeFilename;
            Path destino = uploadPath.resolve(filename).normalize();
            file.transferTo(destino);
            return "/uploads/carnets/" + filename;
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo guardar la foto del carnet.", e);
        }
    }
}
