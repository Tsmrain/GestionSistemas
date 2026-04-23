package com.reservas.residencial.infrastructure.storage;

import com.reservas.residencial.application.ports.out.FileStoragePort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Service
public class MockFileStorageAdapter implements FileStoragePort {

    @Override
    public String guardar(MultipartFile file) {
        return "http://mock-storage.com/" + UUID.randomUUID() + "_" + file.getOriginalFilename();
    }
}
