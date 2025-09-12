// VentasListar.jsx
import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import AppNotification from '../../components/Notification';
import { Tag } from 'primereact/tag';
import SearchBar from '../../components/SearchBar';
import '../../adminStyles.css';

export default function VentasListar({
    ventasFiltradas,
    abrirModal,
    generarPDFVenta,
    setVentaSeleccionada,
    setMostrarModalAbonos,
    manejarCambioEstado,
    notification,
    hideNotification,
    getRowClassName,
    filtroTipoVenta,
    setFiltroTipoVenta,
    verDetalleVenta,
    estadosVenta,
    setFiltro,
    setMostrarAgregarVenta
}) {

    // NUEVA FUNCIÓN para formatear valores a moneda
    const formatearMoneda = (valor) => {
        const numero = parseFloat(valor || 0);
        return numero.toLocaleString('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    };

    const getSeverityClass = (nombreEstado) => {
        switch (nombreEstado) {
            case 'Activa':
                return 'estado-activa';
            case 'Anulada':
                return 'estado-anulada';
            case 'En espera':
            case 'Pendiente':
                return 'estado-espera';
            case 'En producción':
            case 'En Proceso':
                return 'estado-produccion';
            case 'Por entregar':
                return 'estado-entregar';
            case 'Finalizado':
            case 'Completada':
                return 'estado-finalizado';
            default:
                return '';
        }
    };

    const estadoBodyTemplate = (rowData) => {
        const estadoAnuladoId = estadosVenta.find(e => e.nombre_estado === 'Anulada')?.idestadoventa;
        const estadoActivoId = estadosVenta.find(e => e.nombre_estado === 'Activa')?.idestadoventa;
        const estadoFinalizadoId = estadosVenta.find(e => e.nombre_estado === 'Finalizado')?.idestadoventa;
        const estadoCompletadaId = estadosVenta.find(e => e.nombre_estado === 'Completada')?.idestadoventa;

        const isStaticState = (
            rowData.idEstadoVenta === estadoAnuladoId ||
            rowData.idEstadoVenta === estadoFinalizadoId ||
            rowData.idEstadoVenta === estadoCompletadaId ||
            (rowData.tipoVenta === 'directa' && rowData.idEstadoVenta === estadoActivoId)
        );

        const estadoActual = estadosVenta.find(e => e.idestadoventa === rowData.idEstadoVenta);
        const nombreEstadoActual = estadoActual?.nombre_estado || rowData.nombreEstado;

        if (isStaticState) {
            return (
                <Tag
                    value={nombreEstadoActual}
                    className={`estado-tag ${getSeverityClass(nombreEstadoActual)}`}
                />
            );
        } else {
            const opcionesDropdown = estadosVenta.filter(estado => {
                const nombreEstado = estado.nombre_estado;
                return nombreEstado !== 'Activa' && nombreEstado !== 'Anulada';
            });

            const selectedTemplate = (option) => {
                if (option) {
                    return (
                        <Tag 
                            value={option.nombre_estado} 
                            className={`estado-tag ${getSeverityClass(option.nombre_estado)}`}
                        />
                    );
                }
                return null;
            };

            const itemTemplate = (option) => {
                return (
                    <Tag 
                        value={option.nombre_estado} 
                        className={`estado-tag ${getSeverityClass(option.nombre_estado)}`}
                    />
                );
            };

            return (
                <Dropdown
                    value={estadoActual}
                    options={opcionesDropdown}
                    onChange={(e) => manejarCambioEstado(rowData.idVenta, e.value.idestadoventa)}
                    optionLabel="nombre_estado"
                    valueTemplate={selectedTemplate}
                    itemTemplate={itemTemplate}
                    className="estado-dropdown"
                    panelClassName="estado-dropdown-panel"
                />
            );
        }
    };

    const actionBodyTemplate = (rowData) => {
        const estadoAnuladoId = estadosVenta.find(e => e.nombre_estado === 'Anulada')?.idestadoventa;
        const estadoActivoId = estadosVenta.find(e => e.nombre_estado === 'Activa')?.idestadoventa;
        const isAnulable = rowData.idEstadoVenta !== estadoAnuladoId && rowData.idEstadoVenta !== estadoActivoId;

        return (
            <div className="action-buttons-container">
                <button
                    className="admin-button gray"
                    title="Ver Detalle"
                    onClick={() => verDetalleVenta(rowData)}
                >
                    🔍
                </button>
                <button
                    className="admin-button red"
                    title="Anular"
                    onClick={() => abrirModal('anular', rowData)}
                    disabled={rowData.idEstadoVenta === estadoAnuladoId}
                >
                    🛑
                </button>
                <button
                    className="admin-button blue"
                    title="Descargar PDF"
                    onClick={() => generarPDFVenta(rowData)}
                >
                    ⬇️
                </button>
               {rowData.tipoVenta === 'pedido' && isAnulable && (
                    <button
                        className="admin-button green"
                        title="Abonos"
                        onClick={() => setMostrarModalAbonos(rowData)}  
                    >
                        💰
                    </button>
                )}
            </div>
        );
    };

    return (
        <>
            <AppNotification
                visible={notification.visible}
                mensaje={notification.mensaje}
                tipo={notification.tipo}
                onClose={hideNotification}
            />

            <div className="admin-toolbar">
                <button
                    className="admin-button pink"
                    onClick={() => setMostrarAgregarVenta(true)}
                    type="button"
                >
                    + Agregar
                </button>
                <SearchBar
                    placeholder="Buscar venta..."
                    onChange={setFiltro}
                />
            </div>

            <div className="ventas-header-container">
                <h2 className="admin-section-title">Gestión de Ventas</h2>
                <div className="filter-buttons-container">
                    <button
                        className={`filter-tab ${filtroTipoVenta === 'directa' ? 'filter-tab-active' : ''}`}
                        onClick={() => setFiltroTipoVenta('directa')}
                    >
                        Directas
                    </button>
                    <button
                        className={`filter-tab ${filtroTipoVenta === 'pedido' ? 'filter-tab-active' : ''}`}
                        onClick={() => setFiltroTipoVenta('pedido')}
                    >
                        Pedidos
                    </button>
                    <button
                        className={`filter-tab ${filtroTipoVenta === 'anulado' ? 'filter-tab-active' : ''}`}
                        onClick={() => setFiltroTipoVenta('anulado')}
                    >
                        Anuladas
                    </button>
                </div>
            </div>

            <DataTable
                value={ventasFiltradas}
                className="admin-table"
                dataKey="idVenta"
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25]}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} ventas"
                emptyMessage="No se encontraron ventas."
                rowClassName={getRowClassName}
            >
                <Column field="idVenta" header="N°"></Column>
                <Column field="nombreCliente" header="Cliente"></Column>
                <Column field="nombreSede" header="Sede"></Column>
                <Column field="metodoPago" header="Método de Pago"></Column>
                <Column field="tipoVenta" header="Tipo de Venta"></Column>
                <Column
                    field="nombreEstado"
                    header="Estado"
                    body={estadoBodyTemplate}
                    style={{ minWidth: '110px', maxWidth: '130px' }}
                ></Column>
                {/* MODIFICACIÓN: Se agrega el `body` para dar formato de moneda */}
                <Column 
                    field="total" 
                    header="Total"
                    body={(rowData) => formatearMoneda(rowData.total)}
                ></Column>
                <Column header="Acciones" body={actionBodyTemplate}></Column>
            </DataTable>

            <style jsx>{`
                .estado-dropdown {
                    border: none !important;
                    box-shadow: none !important;
                    background: transparent !important;
                    width: 100% !important;
                    max-width: 140px !important;
                    transition: all 0.2s ease-in-out;
                    border-radius: 6px !important;
                }
                
                .estado-dropdown .p-dropdown-trigger {
                    display: none !important;
                }
                
                .estado-dropdown .p-dropdown-label {
                    border: none !important;
                    padding: 0 !important;
                    background: transparent !important;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }
                
                .estado-dropdown:hover {
                    background: #e9ecef !important;
                    cursor: pointer;
                }

                .estado-dropdown-panel {
                    border: 1px solid #dee2e6 !important;
                    border-radius: 6px !important;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15) !important;
                    background-color: transparent !important;
                    max-height: none !important;
                }
                
                .estado-dropdown-panel .p-dropdown-items .p-dropdown-item {
                    padding: 0.6rem 0.8rem !important;
                    margin: 0.2rem 0 !important;
                    border-radius: 4px !important;
                }
                
                .estado-dropdown-panel .p-dropdown-items .p-dropdown-item:hover {
                    background-color: #f1f3f5 !important;
                }
                
                .estado-tag {
                    font-size: 0.75rem !important;
                    font-weight: 600 !important;
                    padding: 0.35rem 0.8rem !important;
                    border-radius: 10px !important;
                    min-width: 90px !important;
                    text-align: center !important;
                    display: inline-block !important;
                    white-space: nowrap !important;
                    overflow: hidden !important;
                    text-overflow: ellipsis !important;
                    background-color: #f1f3f5 !important;
                    color: black !important;
                }
                
                .estado-activa {
                    background-color: #10b981 !important;
                    color: white !important;
                }
                
                .estado-anulada {
                    background-color: #ef4444 !important;
                    color: white !important;
                }
                
                .estado-espera {
                    background-color: #f59e0b !important;
                    color: white !important;
                }
                
                .estado-produccion {
                    background-color: #3b82f6 !important;
                    color: white !important;
                }
                
                .estado-entregar {
                    background-color: #ec4899 !important;
                    color: white !important;
                }
                
                .estado-finalizado,
                .estado-completada {
                    background-color: #8b5cf6 !important;
                    color: white !important;
                }
                
                .admin-table .row-anulado {
                    background-color: #fdf2f8 !important;
                }
                
                .admin-table .row-anulado:hover {
                    background-color: #fce7f3 !important;
                }
            `}</style>
        </>
    );
}