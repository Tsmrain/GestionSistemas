package com.reservas.residencial.application.ports.out;

import org.springframework.web.multipart.MultipartFile;

public interface FileStoragePort {
    String guardar(MultipartFile file);
}
