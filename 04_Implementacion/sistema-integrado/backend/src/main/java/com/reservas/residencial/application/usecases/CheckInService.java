package com.reservas.residencial.application.usecases;

import com.reservas.residencial.application.dto.*;
import com.reservas.residencial.application.ports.out.*;
import com.reservas.residencial.domain.models.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @referencia: CU-04 Realizar Check-in
 */
@Service
@RequiredArgsConstructor
public class CheckInService {

    private final ReservaRepositoryPort reservaRepository;
    private final HabitacionRepositoryPort habitacionRepository;
    private final HuespedRepositoryPort huespedRepository;
    private final FileStoragePort fileStoragePort;
    private final PagoRepositoryPort pagoRepository;
    private final InventarioItemRepositoryPort itemRepository;
    private final HabitacionInventarioRepositoryPort habitacionInventarioRepository;
    private final VerificacionCheckoutRepositoryPort verificacionCheckoutRepository;
    private final ConsumoExtraRepositoryPort consumoExtraRepository;
    private final EgresoRepositoryPort egresoRepository;
    private final IncidenciaMantenimientoRepositoryPort incidenciaRepository;

    @Transactional(readOnly = true)
    public List<ReservaResponse> buscarReservasPorCi(String ci) {
        return reservaRepository.findByHuespedCi(ci).stream()
                .filter(r -> "PENDIENTE_PAGO".equals(r.getEstado()) || "PAGADA".equals(r.getEstado()) || "ACTIVA".equals(r.getEstado()))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReservaResponse> buscarReservasPorNombre(String nombre) {
        return reservaRepository.findByHuespedNombre(nombre).stream()
                .filter(this::esReservaVisibleParaCheckIn)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReservaResponse> buscarReservasPorCodigo(Long reservaId) {
        return reservaRepository.findById(reservaId)
                .filter(this::esReservaVisibleParaCheckIn)
                .map(this::toResponse)
                .map(List::of)
                .orElseGet(List::of);
    }

    @Transactional
    public ReservaResponse realizarCheckIn(Long reservaId, String acompananteNombre, String acompananteCi,
                                           LocalDate acompananteFechaNacimiento, String acompananteCelular,
                                           MultipartFile fotoAnverso, MultipartFile fotoReverso, String recepcionista) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada"));

        if (!"PAGADA".equals(reserva.getEstado())) {
            throw new IllegalStateException("La reserva debe estar PAGADA antes de realizar el check-in. Estado actual: " + reserva.getEstado());
        }
        if (recepcionista == null || recepcionista.isBlank()) {
            throw new IllegalArgumentException("Debe iniciar sesion como recepcionista para realizar el check-in.");
        }

        Huesped acompananteGuardado = null;
        boolean tieneNombreAcompanante = acompananteNombre != null && !acompananteNombre.trim().isEmpty();
        boolean tieneCiAcompanante = acompananteCi != null && !acompananteCi.trim().isEmpty();
        boolean tieneFechaNacimientoAcompanante = acompananteFechaNacimiento != null;
        if (tieneNombreAcompanante || tieneCiAcompanante || tieneFechaNacimientoAcompanante) {
            if (!tieneNombreAcompanante || !tieneCiAcompanante || !tieneFechaNacimientoAcompanante) {
                throw new IllegalArgumentException("Para registrar acompanante debe ingresar nombre, CI y fecha de nacimiento.");
            }
        }

        if (tieneNombreAcompanante && tieneCiAcompanante && tieneFechaNacimientoAcompanante) {
            Huesped acompanante = new Huesped();
            acompanante.setNombre(acompananteNombre);
            acompanante.setCi(acompananteCi);
            acompanante.setFechaNacimiento(acompananteFechaNacimiento);
            acompanante.setCelular(acompananteCelular);

            if (fotoAnverso != null && !fotoAnverso.isEmpty()) {
                acompanante.setUrlFotoAnverso(fileStoragePort.guardar(fotoAnverso));
            }
            if (fotoReverso != null && !fotoReverso.isEmpty()) {
                acompanante.setUrlFotoReverso(fileStoragePort.guardar(fotoReverso));
            }
            acompananteGuardado = huespedRepository.save(acompanante);
        }

        reserva.realizarCheckIn(acompananteGuardado, recepcionista);
        reserva.getHabitacion().setEstadoActual("Ocupada");
        
        habitacionRepository.save(reserva.getHabitacion());
        return toResponse(reservaRepository.save(reserva));
    }

    @Transactional
    public PuertaAccesoResponse validarAccesoPuerta(ValidarPuertaRequest request) {
        Long reservaId = extraerReservaIdDesdeQR(request.codigo());
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada para el QR."));

        String habitacionReserva = reserva.getHabitacion().getNumero();
        if (!habitacionReserva.equals(String.valueOf(request.habitacion()).trim())) {
            throw new IllegalStateException("El QR pertenece a la habitacion " + habitacionReserva + ".");
        }

        if ("ACTIVA".equals(reserva.getEstado())) {
            return new PuertaAccesoResponse(true, "La puerta ya estaba abierta para esta reserva.", toResponse(reserva));
        }

        if (!"PAGADA".equals(reserva.getEstado())) {
            throw new IllegalStateException("La reserva debe estar PAGADA antes de abrir la puerta. Estado actual: " + reserva.getEstado());
        }

        reserva.realizarCheckIn(null, "Tablet puerta");
        reserva.getHabitacion().setEstadoActual("Ocupada");
        habitacionRepository.save(reserva.getHabitacion());

        Reserva reservaActualizada = reservaRepository.save(reserva);
        return new PuertaAccesoResponse(true, "Acceso autorizado. La puerta esta abierta.", toResponse(reservaActualizada));
    }

    @Transactional
    public void cancelarPorInconsistenciaIdentidad(Long reservaId) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada"));
                
        reserva.setEstado("CANCELADA");
        reserva.getHabitacion().setEstadoActual("Disponible");
        
        habitacionRepository.save(reserva.getHabitacion());
        reservaRepository.save(reserva);
    }

    private boolean esReservaVisibleParaCheckIn(Reserva reserva) {
        return "PENDIENTE_PAGO".equals(reserva.getEstado()) || "PAGADA".equals(reserva.getEstado()) || "ACTIVA".equals(reserva.getEstado());
    }

    private Long extraerReservaIdDesdeQR(String codigo) {
        String valor = String.valueOf(codigo == null ? "" : codigo).trim();
        String soloDigitos = valor.replaceAll("\\D+", "");
        if (soloDigitos.isBlank()) {
            throw new IllegalArgumentException("El QR no contiene un codigo de reserva valido.");
        }
        return Long.valueOf(soloDigitos);
    }

    private ReservaResponse toResponse(Reserva reserva) {
        Pago pago = pagoRepository.findLatestCompletedByReservaId(reserva.getId())
                .or(() -> pagoRepository.findLatestByReservaId(reserva.getId()))
                .orElse(null);

        return new ReservaResponse(
                reserva.getId(),
                reserva.getEstado(),
                reserva.getFechaIngreso(),
                reserva.getCantidadBloques(),
                reserva.getMontoTotal(),
                new HuespedResumenResponse(
                        reserva.getHuesped().getId(),
                        reserva.getHuesped().getNombre(),
                        reserva.getHuesped().getCi(),
                        reserva.getHuesped().getFechaNacimiento(),
                        reserva.getHuesped().getCelular(),
                        reserva.getHuesped().getUrlFotoAnverso(),
                        reserva.getHuesped().getUrlFotoReverso()
                ),
                new HabitacionResumenResponse(
                        reserva.getHabitacion().getId(),
                        reserva.getHabitacion().getNumero(),
                        new TipoHabitacionResponse(
                                reserva.getHabitacion().getTipo().getId(),
                                reserva.getHabitacion().getTipo().getNombreTipo(),
                                reserva.getHabitacion().getTipo().getPrecioBase(),
                                reserva.getHabitacion().getTipo().getDuracionHoras(),
                                reserva.getHabitacion().getTipo().getDescripcion()
                        )
                ),
                reserva.getAcompanante() != null ? new HuespedResumenResponse(
                        reserva.getAcompanante().getId(),
                        reserva.getAcompanante().getNombre(),
                        reserva.getAcompanante().getCi(),
                        reserva.getAcompanante().getFechaNacimiento(),
                        reserva.getAcompanante().getCelular(),
                        reserva.getAcompanante().getUrlFotoAnverso(),
                        reserva.getAcompanante().getUrlFotoReverso()
                ) : null,
                reserva.getHoraIngreso(),
                reserva.getHoraSalidaEstimada(),
                pago != null ? pago.getMetodo() : null,
                pago != null ? pago.getEstado() : null
        );
    }

    @Transactional
    public PreverificacionResponse preverificarCheckout(PreverificacionRequest request) {
        Reserva reserva = reservaRepository.findById(request.reservaId())
                .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada: " + request.reservaId()));

        Habitacion habitacion = reserva.getHabitacion();

        boolean conforme = true;
        for (ItemPreverificacion det : request.detalles()) {
            if (!"OK".equals(det.estadoReportado())) {
                conforme = false;
            }
        }

        VerificacionCheckout verificacion = new VerificacionCheckout(
                reserva,
                habitacion,
                request.recepcionista(),
                request.nombreCamarera(),
                conforme,
                request.observaciones()
        );
        verificacion = verificacionCheckoutRepository.save(verificacion);

        Double totalCargosExtra = 0.0;
        List<PreverificacionResponse.DetalleVerificacionResponse> listDetalles = new ArrayList<>();

        for (ItemPreverificacion det : request.detalles()) {
            InventarioItem item = itemRepository.findById(det.itemId())
                    .orElseThrow(() -> new IllegalArgumentException("Item no encontrado: " + det.itemId()));

            HabitacionInventario habInv = habitacionInventarioRepository.findByHabitacionIdAndItemId(habitacion.getId(), item.getId())
                    .orElse(null);
            if (habInv != null) {
                if (!"OK".equals(det.estadoReportado())) {
                    habInv.setCantidadActual(Math.max(0, habInv.getCantidadEsperada() - det.cantidad()));
                    habInv.setEstadoVerificacion(det.estadoReportado());
                } else {
                    habInv.setCantidadActual(habInv.getCantidadEsperada());
                    habInv.setEstadoVerificacion("OK");
                }
                habitacionInventarioRepository.save(habInv);
            }

            if ("DAÑADO".equals(det.estadoReportado())) {
                IncidenciaMantenimiento incidencia = new IncidenciaMantenimiento(
                        habitacion,
                        item,
                        "Daño en " + item.getNombre() + " reportado por camarera " + request.nombreCamarera() + " durante check-out.",
                        request.recepcionista()
                );
                incidenciaRepository.save(incidencia);
            }

            Double cargo = 0.0;
            boolean cobrado = det.cobrado() != null ? det.cobrado() : true;

            if (!"OK".equals(det.estadoReportado())) {
                Double precioMulta = item.getPrecioVenta() != null ? item.getPrecioVenta() : 0.0;
                cargo = precioMulta * det.cantidad();

                if (cargo > 0) {
                    if (cobrado) {
                        totalCargosExtra += cargo;
                        String itemsJson = "[{\"id\":\"" + item.getNombre() + "\",\"nombre\":\"Penalidad: " + item.getNombre() + " (" + det.estadoReportado() + ")\",\"emoji\":\"" + (item.getEmoji() != null ? item.getEmoji() : "⚠️") + "\",\"cantidad\":" + det.cantidad() + ",\"precio\":" + precioMulta + ",\"subtotal\":" + cargo + "}]";
                        String payload = "CONSUMO|" + reserva.getId() + "|BS " + cargo;
                        String qrData = "https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=18&data=" +
                                java.net.URLEncoder.encode(payload, java.nio.charset.StandardCharsets.UTF_8);

                        ConsumoExtra consumoPenalty = new ConsumoExtra(reserva, itemsJson, cargo, qrData);
                        consumoExtraRepository.save(consumoPenalty);
                    } else {
                        Double costoCompra = item.getPrecioCompra() != null ? item.getPrecioCompra() : 0.0;
                        Double totalPerdido = costoCompra * det.cantidad();
                        if (totalPerdido > 0) {
                            Egreso egreso = new Egreso(
                                    "Pérdida asumida: " + item.getNombre() + " (" + det.estadoReportado() + ") en Hab. " + habitacion.getNumero(),
                                    totalPerdido,
                                    "INVENTARIO",
                                    request.recepcionista(),
                                    null
                            );
                            egresoRepository.save(egreso);
                        }
                    }
                }
            }

            VerificacionDetalle verDetalle = new VerificacionDetalle(
                    verificacion,
                    item,
                    det.estadoReportado(),
                    det.cantidad(),
                    cargo,
                    cobrado
            );
            verDetalle = verificacionCheckoutRepository.saveDetalle(verDetalle);

            listDetalles.add(new PreverificacionResponse.DetalleVerificacionResponse(
                    verDetalle.getId(),
                    item.getId(),
                    item.getNombre(),
                    verDetalle.getEstadoReportado(),
                    verDetalle.getCantidad(),
                    verDetalle.getCargoAplicado(),
                    verDetalle.getCobrado()
            ));
        }

        // Finalizar reserva y actualizar estado de la habitación
        reserva.finalizarEstadia();
        reservaRepository.save(reserva);

        boolean tieneDanos = request.detalles().stream().anyMatch(d -> "DAÑADO".equals(d.estadoReportado()));
        if (tieneDanos) {
            habitacion.setEstadoActual("Mantenimiento");
        } else {
            habitacion.setEstadoActual("Limpieza");
        }
        habitacionRepository.save(habitacion);

        return new PreverificacionResponse(
                verificacion.getId(),
                reserva.getId(),
                habitacion.getId(),
                verificacion.getFechaVerificacion(),
                verificacion.getRecepcionista(),
                verificacion.getNombreCamarera(),
                verificacion.getConforme(),
                verificacion.getObservaciones(),
                totalCargosExtra,
                listDetalles
        );
    }
}
