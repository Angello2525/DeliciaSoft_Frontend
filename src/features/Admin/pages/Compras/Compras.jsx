import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import '../../adminStyles.css';
import Modal from '../../components/modal';
import SearchBar from '../../components/SearchBar';
import Notification from '../../components/Notification';
import AgregarInsumosModal from '../../components/AgregarInsumosModal';
import { generarPDFCompra, configurarEmpresa } from '../pdf';
import { XCircle } from 'lucide-react';
import compraApiService from '../../services/compras_services'; 
import proveedorApiService from '../../services/proveedor_services'; // Asumiendo que tienes este servicio

export default function ComprasTable() {
    const [compras, setCompras] = useState([]);
    const [filtro, setFiltro] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalTipo, setModalTipo] = useState(null);
    const [compraSeleccionada, setCompraSeleccionada] = useState(null);
    const [notification, setNotification] = useState({ visible: false, mensaje: '', tipo: 'success' });
    const [mostrarAgregarCompra, setMostrarAgregarCompra] = useState(false);
    const [insumosSeleccionados, setInsumosSeleccionados] = useState([]);
    const [mostrarModalInsumos, setMostrarModalInsumos] = useState(false);
    const [mostrarAnuladas, setMostrarAnuladas] = useState(false);
    const [proveedores, setProveedores] = useState([]);
    const [cargando, setCargando] = useState(false);
    
    const [errores, setErrores] = useState({
        proveedor: '',
        fecha_compra: '',
        insumos: ''
    });

    const formatoCOP = (valor) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(valor);
    };

    const generarPDF = async (compra) => {
        try {
            // Obtener los detalles completos de la compra
            const compraCompleta = await compraApiService.obtenerCompraPorId(compra.id);
            
            if (!compraCompleta.detalles || compraCompleta.detalles.length === 0) {
                setNotification({
                    visible: true,
                    mensaje: 'No se puede generar PDF: La compra no tiene insumos registrados',
                    tipo: 'error'
                });
                return;
            }

            const datosCompra = {
                id: compraCompleta.id,
                proveedor: compraCompleta.proveedor?.nombre || 'N/A',
                fecha_compra: compraCompleta.fechaCompra,
                fecha_registro: compraCompleta.fechaRegistro,
                observaciones: compraCompleta.observaciones || '',
                insumos: compraCompleta.detalles.map(detalle => ({
                    nombre: detalle.insumo?.nombre || 'N/A',
                    cantidad: detalle.cantidad,
                    precio: detalle.precioUnitario,
                    unidad: detalle.insumo?.unidad || 'N/A'
                }))
            };

            await generarPDFCompra(datosCompra);

            setNotification({
                visible: true,
                mensaje: 'PDF generado exitosamente',
                tipo: 'success'
            });

        } catch (error) {
            console.error('Error al generar PDF:', error);
            setNotification({
                visible: true,
                mensaje: 'Error al generar el PDF: ' + error.message,
                tipo: 'error'
            });
        }
    };

    const obtenerFechaActual = () => new Date().toISOString().split('T')[0];

    const [compraData, setCompraData] = useState({
        proveedor: '',
        idProveedor: null,
        fechaCompra: '',
        fechaRegistro: obtenerFechaActual(),
        observaciones: ''
    });

    // Cargar datos iniciales
    useEffect(() => {
        cargarCompras();
        cargarProveedores();
    }, []);

    const cargarCompras = async () => {
        try {
            setCargando(true);
            const comprasAPI = await compraApiService.obtenerCompras();
            setCompras(comprasAPI);
        } catch (error) {
            console.error('Error al cargar compras:', error);
            setNotification({
                visible: true,
                mensaje: 'Error al cargar las compras: ' + error.message,
                tipo: 'error'
            });
        } finally {
            setCargando(false);
        }
    };

    const cargarProveedores = async () => {
        try {
            console.log('Iniciando carga de proveedores...');
            // Asumiendo que tienes un servicio de proveedores
            const proveedoresAPI = await proveedorApiService.obtenerProveedores();
            console.log('Proveedores obtenidos:', proveedoresAPI);
            setProveedores(proveedoresAPI);
            
            if (!proveedoresAPI || proveedoresAPI.length === 0) {
                console.warn('No se encontraron proveedores');
                setNotification({
                    visible: true,
                    mensaje: 'No se encontraron proveedores disponibles',
                    tipo: 'warning'
                });
            }
        } catch (error) {
            console.error('Error al cargar proveedores:', error);
            setNotification({
                visible: true,
                mensaje: 'Error al cargar los proveedores: ' + error.message,
                tipo: 'error'
            });
        }
    };

    const showNotification = (mensaje, tipo = 'success') => {
        setNotification({ visible: true, mensaje, tipo });
    };
    
    const hideNotification = () => setNotification({ visible: false, mensaje: '', tipo: 'success' });

    const validarFecha = (fecha) => {
        if (!fecha) return 'La fecha de compra es obligatoria';
        const fechaCompra = new Date(fecha);
        const fechaActual = new Date();
        fechaActual.setHours(23, 59, 59, 999); 
        
        if (fechaCompra > fechaActual) {
            return 'La fecha de compra no puede ser mayor al día presente';
        }
        return '';
    };

    const validarProveedor = (idProveedor) => {
        if (!idProveedor) return 'Debe seleccionar un proveedor';
        return '';
    };

    const validarInsumos = (insumos) => {
        if (insumos.length === 0) return 'Debe agregar al menos un insumo';
        return '';
    };

    const abrirModal = async (tipo, compra = null) => {
        setModalTipo(tipo);
        setCompraSeleccionada(compra);
        
        if (tipo === 'ver' && compra) {
            try {
                setCargando(true);
                // Cargar los detalles completos de la compra
                const compraCompleta = await compraApiService.obtenerCompraPorId(compra.id);
                
                setCompraData({
                    proveedor: compraCompleta.proveedor?.nombre || '',
                    idProveedor: compraCompleta.idProveedor,
                    fechaCompra: compraCompleta.fechaCompra,
                    fechaRegistro: compraCompleta.fechaRegistro,
                    observaciones: compraCompleta.observaciones || ''
                });
                
                // Convertir detalles a formato esperado por el frontend
                const insumosFormateados = compraCompleta.detalles?.map(detalle => ({
                    id: detalle.idInsumo,
                    nombre: detalle.insumo?.nombre || 'N/A',
                    cantidad: detalle.cantidad,
                    precio: detalle.precioUnitario,
                    precioUnitario: detalle.precioUnitario,
                    unidad: detalle.insumo?.unidad || 'N/A'
                })) || [];
                
                setInsumosSeleccionados(insumosFormateados);
                setMostrarAgregarCompra(true);
            } catch (error) {
                console.error('Error al cargar detalles de compra:', error);
                setNotification({
                    visible: true,
                    mensaje: 'Error al cargar los detalles de la compra: ' + error.message,
                    tipo: 'error'
                });
            } finally {
                setCargando(false);
            }
        } else if (tipo === 'agregar') {
            console.log('Proveedores disponibles al abrir modal:', proveedores);
            
            if (proveedores.length === 0) {
                console.log('Recargando proveedores...');
                await cargarProveedores();
            }
            
            setCompraData({
                proveedor: '',
                idProveedor: null,
                fechaCompra: '',
                fechaRegistro: obtenerFechaActual(),
                observaciones: ''
            });
            setInsumosSeleccionados([]);
            setErrores({
                proveedor: '',
                fecha_compra: '',
                insumos: ''
            });
            setMostrarAgregarCompra(true);
        } else if (tipo === 'anular') {
            setModalVisible(true);
        }
    };

    const cerrarModal = () => {
        setModalVisible(false);
        setModalTipo(null);
        setCompraSeleccionada(null);
    };

    const cancelarFormulario = () => {
        setMostrarAgregarCompra(false);
        setCompraSeleccionada(null);
        setModalTipo(null);
        setInsumosSeleccionados([]);
        setCompraData({
            proveedor: '',
            idProveedor: null,
            fechaCompra: '',
            fechaRegistro: obtenerFechaActual(),
            observaciones: ''
        });
        setErrores({
            proveedor: '',
            fecha_compra: '',
            insumos: ''
        });
    };

    const anularCompra = async () => {
        try {
            setCargando(true);
            // Cambiar estado de la compra a anulada
            await compraApiService.cambiarEstadoCompra(compraSeleccionada.id, false);
            
            // Recargar las compras para reflejar el cambio
            await cargarCompras();
            
            cerrarModal();
            showNotification('Compra anulada exitosamente');
        } catch (error) {
            console.error('Error al anular compra:', error);
            setNotification({
                visible: true,
                mensaje: 'Error al anular la compra: ' + error.message,
                tipo: 'error'
            });
        } finally {
            setCargando(false);
        }
    };

    // Función de filtrado mejorada
    const filtrarCompras = (compras, filtro) => {
        if (!filtro || filtro.trim() === '') {
            return compras;
        }

        const filtroLower = filtro.toLowerCase().trim();
        
        return compras.filter(compra => {
            const proveedorMatch = compra.proveedor?.nombre && compra.proveedor.nombre.toLowerCase().includes(filtroLower);
            const fechaMatch = compra.fechaCompra && compra.fechaCompra.toLowerCase().includes(filtroLower);
            const observacionesMatch = compra.observaciones && compra.observaciones.toLowerCase().includes(filtroLower);
            
            const idMatch = compra.id && compra.id.toString().includes(filtroLower);
            const totalMatch = compra.total && compra.total.toString().includes(filtroLower);
            const subtotalMatch = compra.subtotal && compra.subtotal.toString().includes(filtroLower);
            const ivaMatch = compra.iva && compra.iva.toString().includes(filtroLower);
            
            const totalFormateado = compra.total ? formatoCOP(compra.total) : '';
            const subtotalFormateado = compra.subtotal ? formatoCOP(compra.subtotal) : '';
            const ivaFormateado = compra.iva ? formatoCOP(compra.iva) : '';
            
            const totalFormateadoMatch = totalFormateado.toLowerCase().includes(filtroLower);
            const subtotalFormateadoMatch = subtotalFormateado.toLowerCase().includes(filtroLower);
            const ivaFormateadoMatch = ivaFormateado.toLowerCase().includes(filtroLower);
            
            return proveedorMatch || 
                    fechaMatch || 
                    observacionesMatch ||
                    idMatch || 
                    totalMatch || 
                    subtotalMatch || 
                    ivaMatch ||
                    totalFormateadoMatch ||
                    subtotalFormateadoMatch ||
                    ivaFormateadoMatch;
        });
    };

    // Aplicar filtros - asumiendo que el estado se maneja en el campo 'estado'
    const comprasFiltradas = filtrarCompras(compras, filtro).filter(c =>
        mostrarAnuladas ? !c.estado : c.estado
    );

    const handleChange = e => {
        const { name, value } = e.target;
        
        if (name === 'proveedor') {
            console.log('Seleccionando proveedor:', value);
            console.log('Lista de proveedores:', proveedores);
            
            const proveedorSeleccionado = proveedores.find(p => p.nombreCategoria === value || p.nombre === value);
            console.log('Proveedor encontrado:', proveedorSeleccionado);
            
            setCompraData(prev => ({ 
                ...prev, 
                [name]: value,
                idProveedor: proveedorSeleccionado ? proveedorSeleccionado.id : null
            }));
            setErrores(prev => ({ ...prev, proveedor: validarProveedor(proveedorSeleccionado?.id) }));
        } else {
            setCompraData(prev => ({ ...prev, [name]: value }));
            if (name === 'fechaCompra') {
                setErrores(prev => ({ ...prev, fecha_compra: validarFecha(value) }));
            }
        }
    };

    const agregarInsumos = nuevos => {
        const nuevosInsumos = [
            ...insumosSeleccionados,
            ...nuevos.filter(n => !insumosSeleccionados.some(i => i.id === n.id))
        ];
        setInsumosSeleccionados(nuevosInsumos);
        setErrores(prev => ({ ...prev, insumos: validarInsumos(nuevosInsumos) }));
        showNotification('Insumos agregados exitosamente');
    };

    const handleCantidadChange = (id, value) => {
        setInsumosSeleccionados(prev =>
            prev.map(item => (item.id === id ? { ...item, cantidad: Math.max(1, value) } : item))
        );
    };

    const removeInsumo = id => {
        const nuevosInsumos = insumosSeleccionados.filter(item => item.id !== id);
        setInsumosSeleccionados(nuevosInsumos);
        setErrores(prev => ({ ...prev, insumos: validarInsumos(nuevosInsumos) }));
        showNotification('Insumo eliminado de la lista');
    };

    const validarFormulario = () => {
        const errorProveedor = validarProveedor(compraData.idProveedor);
        const errorFecha = validarFecha(compraData.fechaCompra);
        const errorInsumos = validarInsumos(insumosSeleccionados);
        
        setErrores({
            proveedor: errorProveedor,
            fecha_compra: errorFecha,
            insumos: errorInsumos
        });
        
        if (errorProveedor) {
            showNotification(errorProveedor, 'error');
            return false;
        }
        if (errorFecha) {
            showNotification(errorFecha, 'error');
            return false;
        }
        if (errorInsumos) {
            showNotification(errorInsumos, 'error');
            return false;
        }
        return true;
    };

    const guardarCompra = async () => {
        if (!validarFormulario()) return;
        
        try {
            setCargando(true);
            
            // Preparar datos para la compra con detalles
            const nuevaCompraData = {
                idProveedor: compraData.idProveedor,
                fechaCompra: compraData.fechaCompra,
                fechaRegistro: obtenerFechaActual(),
                observaciones: compraData.observaciones || '',
                detalles: insumosSeleccionados.map(insumo => ({
                    idInsumo: insumo.id,
                    cantidad: insumo.cantidad,
                    precioUnitario: insumo.precio || insumo.precioUnitario
                }))
            };

            // Calcular totales usando el método del servicio
            const totales = compraApiService.calcularTotalesCompra(
                insumosSeleccionados.map(insumo => ({
                    subtotalProducto: (insumo.cantidad || 0) * (insumo.precio || insumo.precioUnitario || 0)
                }))
            );

            nuevaCompraData.subtotal = totales.subtotal;
            nuevaCompraData.iva = totales.iva;
            nuevaCompraData.total = totales.total;

            await compraApiService.crearCompra(nuevaCompraData);
            
            // Recargar las compras
            await cargarCompras();
            
            showNotification('Compra guardada exitosamente');
            cancelarFormulario();
        } catch (error) {
            console.error('Error al guardar compra:', error);
            setNotification({
                visible: true,
                mensaje: 'Error al guardar la compra: ' + error.message,
                tipo: 'error'
            });
        } finally {
            setCargando(false);
        }
    };

    const subtotal = insumosSeleccionados.reduce((s, i) => s + (i.precio || i.precioUnitario || 0) * (i.cantidad || 0), 0);
    const iva = subtotal * 0.19; // Cambié a 19% para coincidir con el servicio
    const total = subtotal + iva;
    
    return (
        <div className="admin-wrapper">
        <Notification visible={notification.visible} mensaje={notification.mensaje} tipo={notification.tipo} onClose={hideNotification} />

        {cargando && (
            <div style={{ 
                position: 'fixed', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                background: 'rgba(0,0,0,0.5)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                zIndex: 9999 
            }}>
                <div style={{ 
                    background: 'white', 
                    padding: '20px', 
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <div style={{ 
                        width: '20px', 
                        height: '20px', 
                        border: '2px solid #f3f3f3',
                        borderTop: '2px solid #3498db',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    Cargando...
                </div>
            </div>
        )}

        {!mostrarAgregarCompra ? (
            <>
            <div className="admin-toolbar" >
                <button 
                    className="admin-button pink" 
                    onClick={() => abrirModal('agregar')} 
                    type="button"
                    disabled={cargando}
                >
                    + Agregar
                </button>

                <SearchBar 
                    placeholder="Buscar Compras" 
                    value={filtro} 
                    onChange={setFiltro} 
                />
            </div>

            <div className="admin-section-header">
            <h2 className="admin-tab">Compras</h2>

            <button
                className="admin-tab"
                onClick={() => setMostrarAnuladas(prev => !prev)}
                type="button"
            >
                {mostrarAnuladas ? 'Ver Activas' : 'Ver Anuladas'}
            </button>
            </div>

            <DataTable
                value={comprasFiltradas}
                className="admin-table"
                paginator rows={10} rowsPerPageOptions={[5,10,25,50]}
                rowClassName={rowData => !rowData.estado ? 'fila-anulada' : ''}
            >
                <Column header="N°" body={(r, { rowIndex }) => rowIndex + 1} style={{ width: '3rem', textAlign: 'center' }} />
                <Column 
                    field="proveedor" 
                    header="Proveedor" 
                    body={rowData => rowData.proveedor?.nombre || 'N/A'}
                />
                <Column 
                    field="fechaCompra" 
                    header="Fecha Compra" 
                    body={rowData => {
                        try {
                            return new Date(rowData.fechaCompra).toLocaleDateString('es-ES');
                        } catch {
                            return rowData.fechaCompra || 'N/A';
                        }
                    }}
                />
                <Column
                    field="total"
                    header="Total"
                    body={(rowData) => formatoCOP(rowData.total)}
                />
                <Column
                header="Acción"
                body={rowData => {
                    if (!rowData.estado) return <span style={{ color: 'gray' }}>Anulada</span>;
                    return (
                    <>
                        <button className="admin-button gray" title="Visualizar" onClick={() => abrirModal('ver', rowData)} disabled={cargando}>👁</button>
                        <button
                            className="admin-button red"
                            title="Anular"
                            onClick={() => abrirModal('anular', rowData)}
                            disabled={cargando}
                            >
                            🛑
                            </button>
                        <button 
                            className="admin-button blue" 
                            title="Descargar PDF" 
                            onClick={() => generarPDF(rowData)}
                            disabled={cargando}
                        >
                            <i className="fas fa-download" style={{ marginRight: '5px' }}></i>
                        </button>
                    </>
                    );
                }}
                />
            </DataTable>

            {modalTipo === 'anular' && compraSeleccionada && (
                <Modal visible={modalVisible} onClose={cerrarModal}>
                <h2 className="modal-title">Confirmar Anulación</h2>
                <div className="modal-body">
                    <p>¿Seguro que deseas anular la compra del proveedor <strong>{compraSeleccionada.proveedor?.nombre}</strong>?</p>
                </div>
                <div className="modal-footer">
                    <button className="modal-btn cancel-btn" onClick={cerrarModal} disabled={cargando}>Cancelar</button>
                    <button className="modal-btn save-btn" onClick={anularCompra} disabled={cargando}>Anular</button>
                </div>
                </Modal>
            )}
            </>
        ) : (
                <div className="compra-form-container">
                    <div className="compra-header-actions" style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '1rem'
                    }}>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            Proveedores cargados: {proveedores.length}
                        </div>
                    </div>
                    
                    <div className="compra-fields-grid">
                        <div className="field-group">
                            <label>Proveedor*</label>
                            <select
                                name="proveedor"
                                value={compraData.proveedor}
                                onChange={handleChange}
                                disabled={modalTipo === 'ver' || cargando}
                                style={{ borderColor: errores.proveedor ? 'red' : '' }}
                            >
                                <option value="">---</option>
                                {proveedores.map(proveedor => (
                                    <option key={proveedor.id} value={proveedor.nombreCategoria || proveedor.nombre}>
                                        {proveedor.nombreCategoria || proveedor.nombre}
                                    </option>
                                ))}
                            </select>
                            {errores.proveedor && (
                                <small style={{ color: 'red', fontSize: '12px' }}>
                                    {errores.proveedor}
                                </small>
                            )}
                            {proveedores.length === 0 && (
                                <small style={{ color: 'orange', fontSize: '10px' }}>
                                    No hay proveedores disponibles
                                </small>
                            )}
                        </div>
                        
                        <div className="field-group">
                            <label>Fecha de compra*</label>
                            <input
                                type="date"
                                name="fechaCompra"
                                value={compraData.fechaCompra}
                                onChange={handleChange}
                                disabled={modalTipo === 'ver' || cargando}
                                max={obtenerFechaActual()}
                                style={{ borderColor: errores.fecha_compra ? 'red' : '' }}
                            />
                            {errores.fecha_compra && (
                                <small style={{ color: 'red', fontSize: '12px' }}>
                                    {errores.fecha_compra}
                                </small>
                            )}
                        </div>
                        
                        <div className="field-group">
                            <label>Fecha de registro</label>
                            <input
                                type="date"
                                name="fechaRegistro"
                                value={compraData.fechaRegistro}
                                onChange={handleChange}
                                disabled
                            />
                        </div>
                    </div>
                    
                    <div className="section-divider"></div>
                    
                    <div className="detalle-section">
                        <h2>Detalle*</h2>
                        {errores.insumos && (
                            <small style={{ color: 'red', fontSize: '12px', display: 'block', marginBottom: '10px' }}>
                                {errores.insumos}
                            </small>
                        )}
                                                
                        <table className="compra-detalle-table">
                            <thead className="p-datatable-thead">
                                <tr>
                                    <th>Nombre Producto</th>
                                    <th>Cantidad</th>
                                    <th>Unidad_Medida</th>
                                    <th>Precio unitario</th>
                                    <th>Subtotal</th> 
                                    {modalTipo !== 'ver' && <th>Acción</th>}
                                </tr>
                            </thead>
                            <tbody className="p-datatable">
                                {insumosSeleccionados.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.nombre}</td>
                                    <td>
                                        {modalTipo === 'ver' ? 
                                        (
                                            item.cantidad
                                        ) : (
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.cantidad}
                                                onChange={(e) =>
                                                handleCantidadChange(item.id, parseInt(e.target.value))
                                                }
                                                disabled={cargando}
                                            />
                                        )}
                                    </td>
                                    <td>{item.unidad}</td>
                                    <td>{formatoCOP(item.precio || item.precioUnitario || 0)}</td>
                                    <td>
                                        {formatoCOP((item.cantidad || 0) * (item.precio || item.precioUnitario || 0))}
                                    </td>
                                    {modalTipo !== 'ver' && (
                                        <td>
                                            <button
                                                className="btn-eliminar"
                                                onClick={() => removeInsumo(item.id)}
                                                disabled={cargando}
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    )}
                                </tr>
                                ))}
                            </tbody>
                        </table>

                        {modalTipo !== 'ver' && (
                            <button 
                                className="btn-agregar-insumos"
                                onClick={() => setMostrarModalInsumos(true)}
                                disabled={cargando}
                            >
                                + Agregar Insumos
                            </button>
                        )}
                    </div>
                    
                    <div className="section-divider"></div>
                    
                    <div className="compra-totales-grid">
                        <div className="total-item">
                            <span>Subtotal:</span>
                            <span>{formatoCOP(subtotal)}</span>
                        </div>
                        <div className="total-item">
                            <span>IVA (19%):</span>
                            <span>{formatoCOP(iva)}</span>
                        </div>
                        <div className="total-item">
                            <span>Total:</span>
                            <span>{formatoCOP(total)}</span>
                        </div>
                    </div>

                    <div className="compra-header-actions"
                        style={{
                            marginTop: '1rem',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '0.5rem'
                        }}>
                        <button 
                            className="modal-btn cancel-btn"
                            onClick={cancelarFormulario}
                            disabled={cargando}
                        >
                            {modalTipo === 'ver' ? 'Cerrar' : 'Cancelar'}
                        </button>
                        {modalTipo !== 'ver' && (
                            <button 
                                className="modal-btn save-btn"
                                onClick={guardarCompra}
                                disabled={cargando}
                            >
                                Guardar
                            </button>
                        )}
                    </div>
                    
                    {mostrarModalInsumos && modalTipo !== 'ver' && (
                        <AgregarInsumosModal
                            onClose={() => setMostrarModalInsumos(false)}
                            onAgregar={agregarInsumos}
                        />
                    )}

                    {modalTipo === 'anular' && compraSeleccionada && modalVisible && (
                        <Modal visible={modalVisible} onClose={() => {
                            cerrarModal();
                            setModalTipo('ver');
                        }}>
                        <h2 className="modal-title">Confirmar Anulación</h2>
                        <div className="modal-body">
                            <p>¿Seguro que deseas anular la compra del proveedor <strong>{compraSeleccionada.proveedor?.nombre}</strong>?</p>
                        </div>
                        <div className="modal-footer">
                            <button className="modal-btn cancel-btn" onClick={() => {
                                cerrarModal();
                                setModalTipo('ver'); 
                            }} disabled={cargando}>Cancelar</button>
                            <button className="modal-btn save-btn" onClick={() => {
                                anularCompra();
                                cancelarFormulario(); 
                            }} disabled={cargando}>Anular</button>
                        </div>
                        </Modal>
                    )}
                </div>
            )}
            
            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .fila-anulada {
                    background-color: #ffebee !important;
                    opacity: 0.7;
                }
            `}</style>
        </div>
    );
}