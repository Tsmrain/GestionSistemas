import React, { useState } from "react";

export default function RegistrarReserva({ habitacion, fechaIngreso, onVolver, onExito }) {
  const [ci, setCi] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [telefono, setTelefono] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const buscarHuesped = async () => {
    if (!ci.trim()) return;
    setIsLoading(true);
    try {
      const resp = await fetch(`http://localhost:8080/api/reservas/huesped/${ci}`);
      if (resp.ok) {
        const data = await resp.json();
        if (data && data.nombreCompleto) {
          setNombreCompleto(data.nombreCompleto);
          setTelefono(data.telefono || "");
        }
      }
    } catch (e) {
      console.warn("No se encontró huésped u ocurrió error.", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSiguiente = (e) => {
    e.preventDefault();
    if (!ci.trim() || !nombreCompleto.trim()) {
      setError("El nombre completo y el CI son obligatorios.");
      return;
    }
    setError(null);
    setIsConfirming(true);
  };

  const confirmarReserva = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const resp = await fetch("http://localhost:8080/api/reservas/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ci,
          nombreCompleto,
          telefono,
          idHabitacion: habitacion.id,
          fechaIngreso
        })
      });

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(errText);
      }

      const reservaGuardada = await resp.json();
      onExito(reservaGuardada);
    } catch (err) {
      setError(err.message);
      setIsConfirming(false); // Volver para ver error (ej. concurrencia)
    } finally {
      setIsLoading(false);
    }
  };

  if (isConfirming) {
    return (
      <div className="card">
        <h2>Confirmación de Reserva</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>Revise el resumen de la operación antes de finalizar.</p>
        
        <table className="summary-table">
          <tbody>
            <tr>
              <td>Huésped</td>
              <td>{nombreCompleto} ({ci})</td>
            </tr>
            <tr>
              <td>Habitación</td>
              <td>{habitacion.numero} ({habitacion.tipo})</td>
            </tr>
            <tr>
              <td>Fecha</td>
              <td>{fechaIngreso}</td>
            </tr>
            <tr>
              <td>Monto a Pagar</td>
              <td style={{ fontSize: "20px", color: "var(--accent-color)" }}>{habitacion.precio} Bs.</td>
            </tr>
          </tbody>
        </table>

        {error && <div className="error-message">{error}</div>}

        <button onClick={confirmarReserva} disabled={isLoading}>
          {isLoading ? "Confirmando..." : "Confirmar y Generar Código"}
        </button>
        <button className="secondary" style={{ marginTop: "12px" }} onClick={() => setIsConfirming(false)}>
          Volver a Edición
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <button className="secondary" style={{ width: "auto", padding: "8px 16px", borderRadius: 20 }} onClick={onVolver}>
          ← Volver
        </button>
      </div>
      
      <div className="card">
        <h2>Datos del Huésped</h2>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 20 }}>
          Ingresa el CI. Si el cliente ya existe, cargaremos sus datos.
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSiguiente}>
          <div className="form-group">
            <label>Cédula de Identidad (CI)</label>
            <input 
              type="text" 
              value={ci} 
              onChange={(e) => setCi(e.target.value)} 
              onBlur={buscarHuesped}
              required 
            />
          </div>
          <div className="form-group">
            <label>Nombre Completo</label>
            <input 
              type="text" 
              value={nombreCompleto} 
              onChange={(e) => setNombreCompleto(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Teléfono (Opcional)</label>
            <input 
              type="text" 
              value={telefono} 
              onChange={(e) => setTelefono(e.target.value)} 
            />
          </div>

          <button type="submit" style={{ marginTop: 12 }}>Proceder a Confirmar</button>
        </form>
      </div>
    </div>
  );
}
