package com.reservas.residencial.infrastructure.external.adapters;

import com.reservas.residencial.application.ports.out.BnbPaymentPort;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.Random;

@Component
public class BnbSandboxAdapter implements BnbPaymentPort {

    @Override
    public String generarQR(Double monto, String glosa, Long reservaId) {
        return generarQRSimulado("BNB|" + reservaId + "|" + monto + "|" + glosa);
    }

    @Override
    public String consultarEstado(String externalId) {
        // En sandbox no hay banco real; la confirmacion se dispara desde la demo.
        return "PENDIENTE";
    }

    private String generarQRSimulado(String payload) {
        try {
            int size = 260;
            int modules = 29;
            int margin = 14;
            int cell = (size - margin * 2) / modules;
            BufferedImage image = new BufferedImage(size, size, BufferedImage.TYPE_INT_RGB);
            Graphics2D graphics = image.createGraphics();

            graphics.setColor(Color.WHITE);
            graphics.fillRect(0, 0, size, size);
            graphics.setColor(Color.BLACK);

            Random random = new Random(payload.hashCode());
            for (int row = 0; row < modules; row++) {
                for (int col = 0; col < modules; col++) {
                    if (random.nextBoolean()) {
                        graphics.fillRect(margin + col * cell, margin + row * cell, cell, cell);
                    }
                }
            }

            dibujarMarcador(graphics, margin, margin, cell);
            dibujarMarcador(graphics, margin + (modules - 7) * cell, margin, cell);
            dibujarMarcador(graphics, margin, margin + (modules - 7) * cell, cell);

            graphics.dispose();

            ByteArrayOutputStream output = new ByteArrayOutputStream();
            ImageIO.write(image, "png", output);
            return Base64.getEncoder().encodeToString(output.toByteArray());
        } catch (Exception e) {
            throw new IllegalStateException("No se pudo generar el QR simulado", e);
        }
    }

    private void dibujarMarcador(Graphics2D graphics, int x, int y, int cell) {
        graphics.setColor(Color.WHITE);
        graphics.fillRect(x - cell, y - cell, cell * 9, cell * 9);
        graphics.setColor(Color.BLACK);
        graphics.fillRect(x, y, cell * 7, cell * 7);
        graphics.setColor(Color.WHITE);
        graphics.fillRect(x + cell, y + cell, cell * 5, cell * 5);
        graphics.setColor(Color.BLACK);
        graphics.fillRect(x + cell * 2, y + cell * 2, cell * 3, cell * 3);
    }
}
