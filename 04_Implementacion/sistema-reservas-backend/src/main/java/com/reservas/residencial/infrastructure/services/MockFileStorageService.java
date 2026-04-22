package com.reservas.residencial.infrastructure.services;

import com.reservas.residencial.application.services.FileStorageService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Service
public class MockFileStorageService implements FileStorageService {
    
    @Override
    public String store(MultipartFile file) {
        // Simulación de guardado devolviendo una URL ficticia
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        return "https://supabase.mock.url/storage/v1/object/public/identidades/" + fileName;
    }
}
