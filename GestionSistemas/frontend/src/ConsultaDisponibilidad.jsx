import React, { useState, useEffect } from "react";

export default function ConsultaDisponibilidad({ onSeleccionarHabitacion }) {
  const [tipo, setTipo] = useState("Estándar");
  const [fecha, setFecha] = useState("");
  const [resultados, setResultados] = useState([]);
  const [error, setError] = useState(null);
  const [mensajeSugerencia, setMensajeSugerencia] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Set default date to today
    const today = new Date().toISOString().split("T")[0];
    setFecha(today);
  }, []);

  const handleBuscar = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMensajeSugerencia(null);
    setResultados([]);

    try {
      const resp = await fetch(`http://localhost:8080/api/disponibilidad/buscar?tipo=${tipo}&fecha=${fecha}`);
      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data || "Error al buscar disponibles.");
      }

      if (typeof data === 'string' && data.includes('No hay habitaciones')) {
        setMensajeSugerencia(data);
      } else if (Array.isArray(data) && data.length > 0) {
        setResultados(data);
      } else {
        setResultados([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="card">
        <h2>Consultar Disponibilidad</h2>
        <form onSubmit={handleBuscar}>
          <div className="form-group">
            <label>Tipo de Habitación</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} required>
              <option value="Estándar">Estándar</option>
              <option value="VIP">VIP</option>
              <option value="SuperVIP">SuperVIP</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Fecha de Ingreso</label>
            <input 
              type="date" 
              value={fecha} 
              onChange={(e) => setFecha(e.target.value)} 
              required 
            />
          </div>

          <button type="submit">Buscar Habitaciones</button>
        </form>
      </div>

      {isLoading && (
        <div className="loader-container">
          <div className="spinner"></div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
      
      {mensajeSugerencia && (
        <div className="card">
          <div className="info-message">
            {mensajeSugerencia}
          </div>
        </div>
      )}

      {resultados.length > 0 && (
        <div className="card">
          <h2>Resultados</h2>
          <div>
            {resultados.map((hab) => (
              <div key={hab.id} className="room-item">
                <div className="room-info">
                  <h3>Nº {hab.numero}</h3>
                  <p>{hab.tipo}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="room-price">{hab.precio} Bs.</div>
                  <button 
                    style={{ marginTop: 8, padding: "8px 16px", fontSize: 13, width: "auto" }} 
                    onClick={() => onSeleccionarHabitacion(hab, fecha)}
                  >
                    Seleccionar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
