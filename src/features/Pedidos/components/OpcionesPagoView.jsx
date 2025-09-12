import React, { useState, useEffect } from 'react';
import './OpcionesPagoView.css';
import ventaApiService from '../../Admin/services/venta_services.js';
import sedeApiService from '../../Admin/Services/sedes_services.js'; // Importar servicio de sedes

const OpcionesPagoView = ({ pedido, total, onPedidoCompletado, onAnterior, onOpcionSeleccionada }) => {
  const [metodoPago, setMetodoPago] = useState('');
  const [sedeSeleccionada, setSedeSeleccionada] = useState('');
  const [mostrarDatosBanco, setMostrarDatosBanco] = useState(false);
  const [comprobante, setComprobante] = useState(null);
  const [errorComprobante, setErrorComprobante] = useState('');
  const [numeroPedido] = useState(() => {
    return `PED-${Date.now().toString().slice(-6)}`;
  });

  // Estados para alertas y procesamiento
  const [showAlert, setShowAlert] = useState({ show: false, type: '', message: '' });
  const [showImageUploadAlert, setShowImageUploadAlert] = useState(false);
  const [procesandoPedido, setProcesandoPedido] = useState(false);

  // Estados para sedes
  const [sedes, setSedes] = useState([]);
  const [cargandoSedes, setCargandoSedes] = useState(true);
  const [errorSedes, setErrorSedes] = useState('');

  // Cargar sedes desde la API
  useEffect(() => {
    const cargarSedes = async () => {
      try {
        setCargandoSedes(true);
        setErrorSedes('');
        const sedesData = await sedeApiService.obtenerSedes();
        
        // Transformar sedes para el formato esperado
        const sedesTransformadas = sedesData
          .filter(sede => sede.activo) // Solo sedes activas
          .map(sede => ({
            id: sede.id.toString(),
            nombre: sede.nombre,
            direccion: sede.Direccion || sede.direccion || 'Dirección no disponible',
            horario: sede.horario || '9:00 AM - 6:00 PM',
            telefono: sede.Telefono || sede.telefono
          }));
        
        setSedes(sedesTransformadas);
        
        if (sedesTransformadas.length === 0) {
          setErrorSedes('No hay sedes disponibles');
          // Fallback con sedes por defecto
          setSedes([
            {
              id: 'san-benito',
              nombre: 'San Benito',
              direccion: 'CALLE 9 #7-34',
              horario: '9:00 AM - 6:00 PM'
            },
            {
              id: 'san-pablo',
              nombre: 'San Pablo',
              direccion: 'Carrera 15 #12-45',
              horario: '10:00 AM - 7:00 PM'
            }
          ]);
        }
      } catch (error) {
        console.error('Error al cargar sedes:', error);
        setErrorSedes(`Error al cargar sedes: ${error.message}`);
        // Usar sedes por defecto en caso de error
        setSedes([
          {
            id: 'san-benito',
            nombre: 'San Benito',
            direccion: 'CALLE 9 #7-34',
            horario: '9:00 AM - 6:00 PM'
          },
          {
            id: 'san-pablo',
            nombre: 'San Pablo',
            direccion: 'Carrera 15 #12-45',
            horario: '10:00 AM - 7:00 PM'
          }
        ]);
      } finally {
        setCargandoSedes(false);
      }
    };

    cargarSedes();
  }, []);

  // Calcular totales correctamente
  const calcularTotales = () => {
    let subtotalProductos = 0;
    let subtotalExtras = 0;

    // Calcular subtotal de productos
    if (pedido?.productos) {
      subtotalProductos = pedido.productos.reduce((sum, producto) => 
        sum + (producto.precio * (producto.cantidad || 1)), 0
      );
    }

    // Calcular subtotal de extras (toppings, adiciones, salsas)
    if (pedido?.toppings) {
      subtotalExtras += pedido.toppings.reduce((sum, topping) => sum + (topping.precio || 0), 0);
    }
    if (pedido?.adiciones) {
      subtotalExtras += pedido.adiciones.reduce((sum, adicion) => sum + (adicion.precio || 0), 0);
    }
    if (pedido?.salsas) {
      subtotalExtras += pedido.salsas.reduce((sum, salsa) => sum + (salsa.precio || 0), 0);
    }

    const subtotalTotal = subtotalProductos + subtotalExtras;
    const iva = Math.round(subtotalTotal * 0.19);
    const totalFinal = subtotalTotal + iva;
    const abono = Math.round(totalFinal / 2); // 50% de abono

    return {
      subtotalProductos,
      subtotalExtras,
      subtotalTotal,
      iva,
      totalFinal,
      abono
    };
  };

  const { subtotalProductos, subtotalExtras, subtotalTotal, iva, totalFinal, abono } = calcularTotales();

  // Función para mostrar alertas
  const triggerAlert = (type, message) => {
    setShowAlert({ show: true, type, message });
    setTimeout(() => {
      setShowAlert({ show: false, type: '', message: '' });
    }, 5000);
  };

  const handleMetodoPago = (metodo) => {
    setMetodoPago(metodo);
    setErrorComprobante('');
    setComprobante(null);
    setShowImageUploadAlert(false);

    if (metodo === 'transferencia') {
      setMostrarDatosBanco(true);
      setSedeSeleccionada('');
    } else {
      setMostrarDatosBanco(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setErrorComprobante('');
    setShowImageUploadAlert(false);

    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setErrorComprobante('Solo se permiten archivos de imagen (JPG, PNG, WEBP)');
        setComprobante(null);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrorComprobante('El archivo es demasiado grande. Máximo 5MB.');
        setComprobante(null);
        return;
      }

      setComprobante(file);
      setShowImageUploadAlert(true);
      setTimeout(() => {
        setShowImageUploadAlert(false);
      }, 3000);
    }
  };

  const copiarDatos = () => {
    const datos = `Banco Bancolombia\nAhorro\nCuenta: 123-456-789\nCédula: 12.345.678\nNombre: Juan Pérez\nNequi: 300 123 45 67\nValor a transferir: $${abono.toLocaleString()}`;

    navigator.clipboard.writeText(datos).then(() => {
      triggerAlert('success', 'Datos bancarios copiados al portapapeles');
    });
  };

  const mostrarAlertaEfectivo = () => {
    const sedeInfo = sedes.find(sede => sede.id === sedeSeleccionada);
    const mensaje = `
Número de Pedido: ${numeroPedido}
Sede: ${sedeInfo.nombre}
Dirección: ${sedeInfo.direccion}
Horario: ${sedeInfo.horario}
Valor a pagar: $${abono.toLocaleString()}

IMPORTANTE: Presenta este número de pedido al llegar a la sede.`;

    triggerAlert('info', mensaje);
  };

  // Transformar productos del pedido al formato esperado por la venta
  const transformarProductosParaVenta = () => {
    const productos = [];

    // Agregar productos base
    if (pedido?.productos) {
      pedido.productos.forEach(producto => {
        productos.push({
          idproductogeneral: producto.id,
          cantidad: producto.cantidad || 1,
          precio: producto.precio,
          preciounitario: producto.precio,
          subtotal: producto.precio * (producto.cantidad || 1),
          iva: (producto.precio * (producto.cantidad || 1)) * 0.19
        });
      });
    }

    return productos;
  };

  // FUNCIÓN PRINCIPAL PARA PROCESAR EL PAGO
  const procesarPago = async () => {
    if (!metodoPago) {
      triggerAlert('error', 'Por favor selecciona un método de pago.');
      return;
    }

    if (metodoPago === 'transferencia' && !comprobante) {
      setErrorComprobante('Es obligatorio subir el comprobante de transferencia');
      return;
    }

    if (metodoPago === 'efectivo' && !sedeSeleccionada) {
      triggerAlert('error', 'Por favor selecciona una sede para el pago en efectivo.');
      return;
    }

    // Mostrar loading
    setProcesandoPedido(true);

    try {
      // 1. CREAR LA VENTA
      const sedeInfo = sedes.find(s => s.id === sedeSeleccionada) || sedes[0];
      
      const ventaData = {
        fechaventa: new Date().toISOString(),
        cliente: null, // Cliente genérico por ahora
        clienteNombre: 'Cliente Genérico',
        sede: sedeInfo?.id || 'san-pablo',
        sedeNombre: sedeInfo?.nombre || 'San Pablo',
        metodopago: metodoPago,
        // Si es efectivo en sede = venta directa, si no = pedido
        tipoventa: metodoPago === 'efectivo' ? 'directa' : 'pedido',
        total: totalFinal,
        productos: transformarProductosParaVenta()
      };

      console.log('Creando venta:', ventaData);
      const ventaCreada = await ventaApiService.crearVenta(ventaData);
      console.log('Venta creada:', ventaCreada);

      // 2. CREAR EL ABONO
      const abonoData = {
        idpedido: ventaCreada.idVenta, // El backend usa esto como ID de venta
        metodopago: metodoPago,
        cantidadpagar: abono,
        TotalPagado: abono
      };

      console.log('Creando abono:', abonoData);
      const abonoCreado = await ventaApiService.crearAbono(abonoData, comprobante);
      console.log('Abono creado:', abonoCreado);

      // ÉXITO - Mostrar mensaje según método de pago
      if (metodoPago === 'efectivo') {
        mostrarAlertaEfectivo();
        // Actualizar estado de venta a "activa" para efectivo
        await ventaApiService.actualizarEstadoVenta(ventaCreada.idVenta, 5);
      } else if (metodoPago === 'transferencia') {
        triggerAlert('success', 
          `Pedido creado exitosamente!\n` +
          `Número: ${numeroPedido}\n` +
          `Abono registrado: $${abono.toLocaleString()}\n` +
          `Su pedido quedará pendiente hasta verificar el comprobante.`
        );
        // Mantener en estado "pendiente" (1) hasta verificar comprobante
      }

      // Notificar al componente padre
      const datosPago = {
        metodo: metodoPago,
        sede: sedeSeleccionada,
        abono: abono,
        total: totalFinal,
        numeroPedido: numeroPedido,
        comprobante: comprobante,
        idVenta: ventaCreada.idVenta,
        idAbono: abonoCreado.id
      };

      onOpcionSeleccionada(datosPago);
      
      // Completar pedido después de un delay para que se vea el mensaje
      setTimeout(() => {
        onPedidoCompletado();
      }, 3000);

    } catch (error) {
      console.error('Error al procesar pago:', error);
      triggerAlert('error', 
        `Error al crear el pedido: ${error.message}`
      );
    } finally {
      setProcesandoPedido(false);
    }
  };

  return (
    <div className="opciones-pago-view">
      {/* Overlay de loading */}
      {procesandoPedido && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Procesando pedido...</p>
          </div>
        </div>
      )}

      {/* Alerta personalizada */}
      {showAlert.show && (
        <div className={`custom-alert ${showAlert.type}`}>
          <span className="alert-icon">
            {showAlert.type === 'success' && '✓'}
            {showAlert.type === 'error' && '✗'}
            {showAlert.type === 'info' && 'i'}
          </span>
          <div className="alert-message">
            {showAlert.message.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
          <button className="close-alert-btn" onClick={() => setShowAlert({ show: false, type: '', message: '' })}>
            &times;
          </button>
        </div>
      )}

      {/* Alerta de imagen subida */}
      {showImageUploadAlert && (
        <div className="custom-alert success image-upload-alert">
          <span className="alert-icon">📸</span>
          <div className="alert-message">
            <p>¡Imagen subida correctamente!</p>
            <p className="file-name-display">{comprobante?.name}</p>
          </div>
          <button className="close-alert-btn" onClick={() => setShowImageUploadAlert(false)}>
            &times;
          </button>
        </div>
      )}

      <div className="pago-contenido">
        <div className="seccion-header">
          <h2 className="seccion-title">💳 Opciones de Pago</h2>
          <div className="numero-pedido">
            <span>📋 Número de Pedido: <strong>{numeroPedido}</strong></span>
          </div>
          <div className="alert-info">
            <span className="alert-icon">ℹ️</span>
            <span>Los productos personalizados requieren un abono del 50% para iniciar la producción</span>
          </div>
        </div>

        {/* Resumen del pedido MEJORADO */}
        <div className="resumen-pago">
          <h3 className="resumen-title">📋 Resumen del Pedido</h3>

          {/* Productos */}
          {pedido?.productos && pedido.productos.length > 0 && (
            <div className="productos-lista">
              <h4 className="subseccion-title">Productos:</h4>
              {pedido.productos.map((producto, index) => (
                <div key={index} className="producto-pago-item">
                  <span className="producto-nombre">{producto.nombre}</span>
                  <span className="producto-cantidad">x{producto.cantidad || 1}</span>
                  <span className="producto-precio">${(producto.precio * (producto.cantidad || 1)).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}

          {/* Toppings */}
          {pedido?.toppings && pedido.toppings.length > 0 && (
            <div className="extras-section">
              <h4 className="subseccion-title">Toppings:</h4>
              {pedido.toppings.map((topping, index) => (
                <div key={index} className="extra-item">
                  <span>{topping.nombre}</span>
                  <span>${(topping.precio || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}

          {/* Adiciones */}
          {pedido?.adiciones && pedido.adiciones.length > 0 && (
            <div className="extras-section">
              <h4 className="subseccion-title">Adiciones:</h4>
              {pedido.adiciones.map((adicion, index) => (
                <div key={index} className="extra-item">
                  <span>{adicion.nombre}</span>
                  <span>${adicion.precio.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}

          {/* Salsas */}
          {pedido?.salsas && pedido.salsas.length > 0 && (
            <div className="extras-section">
              <h4 className="subseccion-title">Salsas:</h4>
              {pedido.salsas.map((salsa, index) => (
                <div key={index} className="extra-item">
                  <span>{salsa.nombre}</span>
                  <span>${salsa.precio.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}

          {/* Totales detallados */}
          <div className="totales">
            <div className="total-item">
              <span>Productos:</span>
              <span>${subtotalProductos.toLocaleString()}</span>
            </div>
            {subtotalExtras > 0 && (
              <div className="total-item">
                <span>Extras (toppings/adiciones/salsas):</span>
                <span>${subtotalExtras.toLocaleString()}</span>
              </div>
            )}
            <div className="total-item">
              <span>Subtotal:</span>
              <span>${subtotalTotal.toLocaleString()}</span>
            </div>
            <div className="total-item">
              <span>IVA (19%):</span>
              <span>${iva.toLocaleString()}</span>
            </div>
            <div className="total-item total-final">
              <span>Total:</span>
              <span>${totalFinal.toLocaleString()}</span>
            </div>
            <div className="total-item abono-destacado">
              <span>📸 Abono requerido (50%):</span>
              <span className="abono-valor">${abono.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Métodos de pago */}
        <div className="metodos-pago">
          <h3 className="metodos-title">Selecciona tu método de pago</h3>

          <div className="metodos-grid">
            {/* Transferencia */}
            <div className={`metodo-card ${metodoPago === 'transferencia' ? 'selected' : ''}`}>
              <label className="metodo-label">
                <input
                  type="radio"
                  name="metodoPago"
                  value="transferencia"
                  checked={metodoPago === 'transferencia'}
                  onChange={() => handleMetodoPago('transferencia')}
                />
                <div className="metodo-content">
                  <div className="metodo-icon">🏦</div>
                  <div className="metodo-info">
                    <h4>Transferencia Bancaria</h4>
                    <p>Bancolombia o Nequi</p>
                  </div>
                </div>
              </label>

              {mostrarDatosBanco && (
                <div className="datos-banco">
                  <div className="banco-info">
                    <h5>📝 Datos para transferencia:</h5>
                    <div className="dato-item">
                      <span className="dato-label">Banco:</span>
                      <span>Bancolombia</span>
                    </div>
                    <div className="dato-item">
                      <span className="dato-label">Tipo:</span>
                      <span>Cuenta de Ahorros</span>
                    </div>
                    <div className="dato-item">
                      <span className="dato-label">Número:</span>
                      <span>123-456-789</span>
                    </div>
                    <div className="dato-item">
                      <span className="dato-label">Cédula:</span>
                      <span>12.345.678</span>
                    </div>
                    <div className="dato-item">
                      <span className="dato-label">Nombre:</span>
                      <span>Juan Pérez</span>
                    </div>
                    <div className="dato-item">
                      <span className="dato-label">Nequi:</span>
                      <span>300 123 45 67</span>
                    </div>
                    <div className="dato-item destacado">
                      <span className="dato-label">Valor a transferir:</span>
                      <span>${abono.toLocaleString()}</span>
                    </div>
                    <button className="btn-copiar" onClick={copiarDatos}>
                      📋 Copiar datos
                    </button>
                  </div>

                  {/* Sección de subir comprobante */}
                  <div className="comprobante-section">
                    <h5>📎 Subir Comprobante <span className="obligatorio">*</span></h5>
                    <div className="upload-area">
                      <input
                        type="file"
                        id="comprobante"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="file-input"
                      />
                      <label htmlFor="comprobante" className="upload-label">
                        {comprobante ? (
                          <div className="file-selected">
                            <span className="file-icon">✅</span>
                            <span className="file-name">{comprobante.name}</span>
                          </div>
                        ) : (
                          <div className="upload-placeholder">
                            <span className="upload-icon">📷</span>
                            <span>Seleccionar imagen del comprobante</span>
                            <small>JPG, PNG, WEBP (máx. 5MB)</small>
                          </div>
                        )}
                      </label>
                    </div>
                    {errorComprobante && (
                      <div className="error-message">
                        <span className="error-icon">❌</span>
                        <span>{errorComprobante}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Efectivo en sede */}
            <div className={`metodo-card ${metodoPago === 'efectivo' ? 'selected' : ''}`}>
              <label className="metodo-label">
                <input
                  type="radio"
                  name="metodoPago"
                  value="efectivo"
                  checked={metodoPago === 'efectivo'}
                  onChange={() => handleMetodoPago('efectivo')}
                />
                <div className="metodo-content">
                  <div className="metodo-icon">💵</div>
                  <div className="metodo-info">
                    <h4>Efectivo en Sede</h4>
                    <p>Paga directamente en nuestras ubicaciones</p>
                  </div>
                </div>
              </label>

              {metodoPago === 'efectivo' && (
                <div className="sedes-efectivo">
                  <h5>📍 Selecciona la sede: <span className="obligatorio">*</span></h5>
                  
                  {cargandoSedes && (
                    <div className="loading-sedes">
                      <div className="loading-spinner-small"></div>
                      <span>Cargando sedes...</span>
                    </div>
                  )}
                  
                  {errorSedes && (
                    <div className="error-sedes">
                      <span className="error-icon">⚠️</span>
                      <span>{errorSedes}</span>
                    </div>
                  )}
                  
                  {!cargandoSedes && sedes.map(sede => (
                    <label key={sede.id} className={`sede-option ${sedeSeleccionada === sede.id ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="sede"
                        value={sede.id}
                        checked={sedeSeleccionada === sede.id}
                        onChange={(e) => setSedeSeleccionada(e.target.value)}
                      />
                      <div className="sede-info">
                        <span className="sede-nombre">{sede.nombre}</span>
                        <span className="sede-direccion">{sede.direccion}</span>
                        <span className="sede-horario">{sede.horario}</span>
                        {sede.telefono && (
                          <span className="sede-telefono">📞 {sede.telefono}</span>
                        )}
                      </div>
                    </label>
                  ))}

                  {sedeSeleccionada && (
                    <div className="valor-efectivo">
                      <span className="valor-label">Valor a pagar:</span>
                      <span className="valor-cantidad">${abono.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="acciones-footer">
          <button className="btn-anterior" onClick={onAnterior}>
            <span className="btn-icon">←</span>
            Anterior
          </button>
          <button
            className="btn-continuar"
            onClick={procesarPago}
            disabled={
              procesandoPedido ||
              !metodoPago || 
              (metodoPago === 'efectivo' && !sedeSeleccionada) || 
              (metodoPago === 'transferencia' && !comprobante)
            }
          >
            {procesandoPedido ? 'Procesando...' : 'Completar Pedido'}
            <span className="btn-icon">✓</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpcionesPagoView;