package com.reservas.residencial.infrastructure.services;

import com.reservas.residencial.application.services.FileStorageService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Service
public class MockFileStorageService implements FileStorageService {
    @Override
    public String guardar(MultipartFile file) {
        return "http://mock-storage.com/" + UUID.randomUUID() + "_" + file.getOriginalFilename();
    }
}
