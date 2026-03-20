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
    <div className="app-container">
      <h1>ResidencialApp</h1>

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
  );
}

export default App;
