import React, { useState } from 'react';
import './index.css';
import ConsultaDisponibilidad from './ConsultaDisponibilidad';
import RegistrarReserva from './RegistrarReserva';

function App() {
  const [paso, setPaso] = useState('consulta'); // 'consulta', 'registrar', 'exito'
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState(null);
  const [fechaReserva, setFechaReserva] = useState("");
  const [reservaConfirmada, setReservaConfirmada] = useState(null);

  const irARegistrar = (habitacion, fecha) => {
    setHabitacionSeleccionada(habitacion);
    setFechaReserva(fecha);
    setPaso('registrar');
  };

  const finalizadoConExito = (reserva) => {
    setReservaConfirmada(reserva);
    setPaso('exito');
  };

  const volverAConsulta = () => {
    setHabitacionSeleccionada(null);
    setFechaReserva("");
    setReservaConfirmada(null);
    setPaso('consulta');
  };

  return (
    <div className="app-container" style={{ margin: "0 auto", padding: 0 }}>
      {/* Portada / Header Extremo a Extremo */}
      <div style={{ marginBottom: 24, paddingBottom: "16px", borderRadius: "0 0 24px 24px", overflow: "hidden", position: "relative", backgroundColor: "#111" }}>
        
        {/* Cover Photo */}
        <img 
          src="/cover.png" 
          alt="Diamonds Residencial Cover" 
          style={{ width: "100%", height: "230px", objectFit: "cover", display: "block", opacity: 0.6 }} 
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        
        {/* Logo and Data overlapping cover */}
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.95))", padding: "40px 20px 20px", color: "white", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center" }}>
          
          {/* Logo representation */}
          <div style={{ width: "80px", height: "80px", marginBottom: "12px", background: "url('/logo.png') center/contain no-repeat", filter: "drop-shadow(0px 4px 10px rgba(0,0,0,0.5))" }}>
            {/* If no file exists, render an SVG fallback */}
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width: "100%", height: "100%"}}>
              <path d="M12 2L2 8L12 22L22 8L12 2Z" stroke="#E0E0E0" strokeWidth="1" fill="rgba(255,255,255,0.8)" />
              <path d="M2 8H22" stroke="#E0E0E0" strokeWidth="1"/>
              <path d="M12 2L8 8L12 22" stroke="#E0E0E0" strokeWidth="1"/>
              <path d="M12 2L16 8L12 22" stroke="#E0E0E0" strokeWidth="1"/>
            </svg>
          </div>

          <h1 style={{ margin: 0, fontSize: "26px", color: "white", letterSpacing: "2px", fontWeight: "300", textAlign: "center", textTransform: "uppercase" }}>
            Diamonds
          </h1>
          <span style={{ fontSize: "11px", letterSpacing: "5px", color: "#A0A0A0", textTransform: "uppercase", marginBottom: "16px" }}>Residencial</span>
          
          <p style={{ color: "#D1D1D6", fontSize: "12px", textAlign: "center", margin: 0, maxWidth: "320px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <span style={{ fontSize: "16px" }}>📍</span>
            <span>Av. Escuadrón Velazco entre 3er y 4to anillo Calle el Torno paralela Av. Grigota, Santa Cruz de la Sierra</span>
          </p>
        </div>
      </div>
      
      {/* Contenido Dinámico de la SPA */}
      <div style={{ padding: "0 20px" }}>
        {paso === 'consulta' && (
        <ConsultaDisponibilidad onSeleccionarHabitacion={irARegistrar} />
      )}

      {paso === 'registrar' && habitacionSeleccionada && (
        <RegistrarReserva 
          habitacion={habitacionSeleccionada} 
          fechaIngreso={fechaReserva}
          onVolver={volverAConsulta}
          onExito={finalizadoConExito}
        />
      )}

      {paso === 'exito' && reservaConfirmada && (
        <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎉</div>
          <h2 style={{ color: "var(--success-color)", marginBottom: "8px" }}>¡Reserva Confirmada!</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>La habitación ha sido guardada.</p>
          
          <div style={{ 
            background: "var(--bg-primary)", 
            padding: "20px", 
            borderRadius: "var(--border-radius-md)",
            marginBottom: "32px",
            fontSize: "24px",
            fontWeight: "700",
            letterSpacing: "2px"
          }}>
            {reservaConfirmada.codigo}
          </div>

          <button onClick={volverAConsulta}>Hacer otra reserva</button>
        </div>
      )}
      </div>
    </div>
  );
}

export default App;
