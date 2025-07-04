import React, { useState, useEffect } from 'react';
import './OpcionesEntregaView.css';

const OpcionesEntregaView = ({ pedido, onSiguiente, onAnterior, onOpcionSeleccionada }) => {
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState('');
  const [datosEntrega, setDatosEntrega] = useState({
    fecha: '',
    hora: '',
    telefono: '',
    observaciones: ''
  });
  
  const [alertas, setAlertas] = useState([]);
  const [errores, setErrores] = useState({});

  const ubicaciones = [
    {
      id: 'san-benito',
      nombre: 'San Benito',
      direccion: 'CALLE 9 #7-34',
      horarios: 'Lunes a Domingo: 9:00 AM - 6:00 PM',
      horaInicio: '09:00',
      horaFin: '18:00',
      icon: '🛒'
    },
    {
      id: 'san-pablo',
      nombre: 'San Pablo',
      direccion: 'Carrera 15 #12-45',
      horarios: 'Lunes a Domingo: 10:00 AM - 7:00 PM',
      horaInicio: '10:00',
      horaFin: '19:00',
      icon: '🛒'
    }
  ];

  // Función para agregar una alerta
  const agregarAlerta = (tipo, mensaje) => {
    const nuevaAlerta = {
      id: Date.now() + Math.random(),
      tipo,
      mensaje,
      timestamp: Date.now()
    };
    
    setAlertas(prev => [...prev, nuevaAlerta]);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
      setAlertas(prev => prev.filter(alerta => alerta.id !== nuevaAlerta.id));
    }, 5000);
  };

  // Función para validar teléfono
  const validarTelefono = (telefono) => {
    const regex = /^[3][0-9]{9}$/;
    return regex.test(telefono.replace(/\s/g, ''));
  };

  // Función para validar fecha (mínimo 15 días, máximo 30 días)
  const validarFecha = (fecha) => {
    if (!fecha) return false;
    
    const fechaSeleccionada = new Date(fecha);
    const fechaActual = new Date();
    const fechaMinima = new Date();
    const fechaMaxima = new Date();
    
    fechaMinima.setDate(fechaMinima.getDate() + 15); // 15 días después
    fechaMaxima.setDate(fechaMaxima.getDate() + 30); // 30 días después
    
    return fechaSeleccionada >= fechaMinima && fechaSeleccionada <= fechaMaxima;
  };

  // Función para validar hora según el día y la ubicación
  const validarHora = (fecha, hora) => {
    if (!fecha || !hora || !ubicacionSeleccionada) return false;
    
    const ubicacion = ubicaciones.find(u => u.id === ubicacionSeleccionada);
    if (!ubicacion) return false;
    
    // Convertir hora a minutos para comparación más fácil
    const convertirHoraAMinutos = (hora) => {
      const [horas, minutos] = hora.split(':').map(Number);
      return horas * 60 + minutos;
    };
    
    const horaSeleccionada = convertirHoraAMinutos(hora);
    const horaInicio = convertirHoraAMinutos(ubicacion.horaInicio);
    const horaFin = convertirHoraAMinutos(ubicacion.horaFin);
    
    return horaSeleccionada >= horaInicio && horaSeleccionada < horaFin;
  };

  // Función para obtener el rango de horarios permitidos
  const obtenerRangoHorarios = () => {
    if (!ubicacionSeleccionada) return '';
    
    const ubicacion = ubicaciones.find(u => u.id === ubicacionSeleccionada);
    if (!ubicacion) return '';
    
    return `${ubicacion.horaInicio} - ${ubicacion.horaFin}`;
  };

  // Validaciones en tiempo real
  useEffect(() => {
    const nuevosErrores = {};
    
    // Validar ubicación
    if (!ubicacionSeleccionada) {
      nuevosErrores.ubicacion = 'Debe seleccionar una ubicación';
    }
    
    // Validar fecha
    if (datosEntrega.fecha) {
      if (!validarFecha(datosEntrega.fecha)) {
        nuevosErrores.fecha = 'La fecha debe estar entre 15 y 30 días desde hoy';
      }
    }
    
    // Validar hora
    if (datosEntrega.hora && datosEntrega.fecha) {
      if (!validarHora(datosEntrega.fecha, datosEntrega.hora)) {
        const rangoHorarios = obtenerRangoHorarios();
        nuevosErrores.hora = `La hora debe estar dentro del horario de atención: ${rangoHorarios}`;
      }
    }
    
    // Validar teléfono
    if (datosEntrega.telefono) {
      if (!validarTelefono(datosEntrega.telefono)) {
        nuevosErrores.telefono = 'El teléfono debe ser un celular colombiano válido (10 dígitos)';
      }
    }
    
    setErrores(nuevosErrores);
  }, [ubicacionSeleccionada, datosEntrega]);

  // Manejar selección de ubicación
  const manejarSeleccionUbicacion = (ubicacionId) => {
    setUbicacionSeleccionada(ubicacionId);
    const ubicacion = ubicaciones.find(u => u.id === ubicacionId);
    agregarAlerta('success', `✅ Ubicación "${ubicacion.nombre}" seleccionada correctamente`);
    
    // Resetear hora si ya había una seleccionada para revalidar
    if (datosEntrega.hora) {
      setDatosEntrega(prev => ({...prev, hora: ''}));
    }
  };

  // Manejar cambio de fecha
  const manejarCambioFecha = (fecha) => {
    setDatosEntrega(prev => ({...prev, fecha}));
    
    if (fecha) {
      if (validarFecha(fecha)) {
        agregarAlerta('success', '✅ Fecha válida seleccionada');
      } else {
        agregarAlerta('error', '❌ La fecha debe estar entre 15 y 30 días desde hoy');
      }
    }
  };

  // Manejar cambio de hora
  const manejarCambioHora = (hora) => {
    setDatosEntrega(prev => ({...prev, hora}));
    
    if (hora && datosEntrega.fecha && ubicacionSeleccionada) {
      if (validarHora(datosEntrega.fecha, hora)) {
        agregarAlerta('success', '✅ Hora válida seleccionada');
      } else {
        const rangoHorarios = obtenerRangoHorarios();
        agregarAlerta('error', `❌ La hora debe estar dentro del horario: ${rangoHorarios}`);
      }
    }
  };

  // Manejar cambio de teléfono
  const manejarCambioTelefono = (telefono) => {
    setDatosEntrega(prev => ({...prev, telefono}));

    if (telefono.length === 10) {
      if (validarTelefono(telefono)) {
        agregarAlerta('success', '✅ Teléfono válido');
      } else {
        agregarAlerta('error', '❌ Ingrese un teléfono celular colombiano válido');
      }
    }
  };

  const handleContinue = () => {
    // Validar campos obligatorios
    const camposObligatorios = [
      { campo: 'ubicacion', valor: ubicacionSeleccionada, mensaje: 'Debe seleccionar una ubicación' },
      { campo: 'fecha', valor: datosEntrega.fecha, mensaje: 'Debe seleccionar una fecha de entrega' },
      { campo: 'hora', valor: datosEntrega.hora, mensaje: 'Debe seleccionar una hora de entrega' },
      { campo: 'telefono', valor: datosEntrega.telefono, mensaje: 'Debe ingresar un teléfono de contacto' }
    ];

    const camposFaltantes = camposObligatorios.filter(campo => !campo.valor);
    
    if (camposFaltantes.length > 0) {
      camposFaltantes.forEach(campo => {
        agregarAlerta('error', `❌ ${campo.mensaje}`);
      });
      return;
    }

    // Validar que no haya errores
    if (Object.keys(errores).length > 0) {
      agregarAlerta('error', '❌ Por favor corrija los errores antes de continuar');
      return;
    }

    // Si todo está bien
    agregarAlerta('success', '✅ Formulario completado correctamente');
    
    setTimeout(() => {
      onOpcionSeleccionada({
        ubicacion: ubicacionSeleccionada,
        datosEntrega: datosEntrega
      });
      onSiguiente();
    }, 1000);
  };

  const isFormValid = ubicacionSeleccionada && 
                      datosEntrega.fecha && 
                      datosEntrega.hora && 
                      datosEntrega.telefono &&
                      Object.keys(errores).length === 0;

  // Calcular fechas mínima y máxima
  const fechaMinima = new Date();
  fechaMinima.setDate(fechaMinima.getDate() + 15);
  const fechaMinimaString = fechaMinima.toISOString().split('T')[0];
  
  const fechaMaxima = new Date();
  fechaMaxima.setDate(fechaMaxima.getDate() + 30);
  const fechaMaximaString = fechaMaxima.toISOString().split('T')[0];

  return (
    <div className="opciones-entrega-container">
      {/* Contenedor de alertas */}
      <div className="alertas-container">
        {alertas.map(alerta => (
          <div 
            key={alerta.id} 
            className={`alerta alerta-${alerta.tipo}`}
          >
            <span className="alerta-mensaje">{alerta.mensaje}</span>
            <button 
              className="alerta-cerrar"
              onClick={() => setAlertas(prev => prev.filter(a => a.id !== alerta.id))}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="entrega-content">
        <div className="entrega-header">
          <h2 className="section-title">Selecciona tu Ubicación</h2>
          <div className="alert-container">
            <div className="alert-icon">⚠️</div>
            <span className="alert-text">Tu pedido contiene productos personalizados.</span>
          </div>
        </div>

        <div className="ubicaciones-container">
          <h3 className="subsection-title">Nuestros Carritos Móviles</h3>
          <div className="ubicaciones-grid">
            {ubicaciones.map((ubicacion) => (
              <label 
                key={ubicacion.id}
                className={`ubicacion-card ${ubicacionSeleccionada === ubicacion.id ? 'selected' : ''} ${errores.ubicacion ? 'error' : ''}`}
              >
                <input 
                  type="radio" 
                  name="ubicacion" 
                  value={ubicacion.id}
                  checked={ubicacionSeleccionada === ubicacion.id}
                  onChange={(e) => manejarSeleccionUbicacion(e.target.value)}
                  className="radio-input"
                />
                <div className="card-content">
                  <div className="ubicacion-icon">{ubicacion.icon}</div>
                  <div className="ubicacion-info">
                    <span className="ubicacion-nombre">{ubicacion.nombre}</span>
                    <span className="ubicacion-direccion">{ubicacion.direccion}</span>
                    <span className="ubicacion-horarios">{ubicacion.horarios}</span>
                  </div>
                  <div className="radio-indicator"></div>
                </div>
              </label>
            ))}
          </div>
          {errores.ubicacion && <span className="error-message">* {errores.ubicacion}</span>}

          {ubicacionSeleccionada && (
            <div className="formulario-entrega">
              <h3 className="form-title">Datos de tu Pedido</h3>
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">📅</span>
                    Fecha de entrega *
                  </label>
                  <input 
                    type="date" 
                    value={datosEntrega.fecha}
                    min={fechaMinimaString}
                    max={fechaMaximaString}
                    onChange={(e) => manejarCambioFecha(e.target.value)}
                    className={`form-input ${errores.fecha ? 'error' : ''}`}
                  />
                  {errores.fecha && <span className="error-message">* {errores.fecha}</span>}
                  <small className="form-help">Entre 15 y 30 días desde hoy</small>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">🕐</span>
                    Hora de entrega *
                  </label>
                  <input 
                    type="time" 
                    value={datosEntrega.hora}
                    onChange={(e) => manejarCambioHora(e.target.value)}
                    className={`form-input ${errores.hora ? 'error' : ''}`}
                    step="1800" // Pasos de 30 minutos
                  />
                  {errores.hora && <span className="error-message">* {errores.hora}</span>}
                  {ubicacionSeleccionada && (
                    <small className="form-help">
                      Horario disponible: {obtenerRangoHorarios()}
                    </small>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">📱</span>
                  Teléfono de contacto *
                </label>
                <input 
                  type="tel" 
                  placeholder="Ej: 3001234567"
                  value={datosEntrega.telefono}
                  onChange={(e) => manejarCambioTelefono(e.target.value)}
                  className={`form-input ${errores.telefono ? 'error' : ''}`}
                  maxLength="10"
                />
                {errores.telefono && <span className="error-message">* {errores.telefono}</span>}
                <small className="form-help">Celular colombiano de 10 dígitos</small>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">💬</span>
                  Observaciones adicionales (Opcional)
                </label>
                <textarea 
                  placeholder="Deja aquí cualquier comentario adicional sobre tu pedido..."
                  value={datosEntrega.observaciones}
                  onChange={(e) => setDatosEntrega(prev => ({...prev, observaciones: e.target.value}))}
                  className="form-textarea"
                  rows="3"
                  maxLength="500"
                />
                <small className="form-help">{datosEntrega.observaciones.length}/500 caracteres</small>
              </div>
            </div>
          )}
        </div>

        <div className="acciones-footer">
          <button 
            onClick={onAnterior}
            className="btn-anterior"
          >
            <span className="btn-icon">←</span>
            Anterior
          </button>
          <button 
            onClick={handleContinue}
            disabled={!isFormValid}
            className="btn-continuar"
          >
            Continuar
            <span className="btn-icon">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpcionesEntregaView;