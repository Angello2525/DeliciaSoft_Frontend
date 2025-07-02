import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import './Produccion/components/Css/Produccion.css';
import Modal from '../components/modal';
import SearchBar from '../components/SearchBar';
import Notification from '../components/Notification';
import ModalAgregarProductos from './Produccion/components/ModalAgregarProductos';
import ModalRecetas from './Produccion/components/ModalRecetas';
import ModalDetalleReceta from './Produccion/components/ModalDetalleReceta';
import ModalInsumos from './Produccion/components/ModalInsumos';
import ModalAgregar from './Produccion/components/ModalAgregar';


export default function Produccion() {
    const [procesos, setProcesos] = useState([]);
    const [filtro, setFiltro] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalTipo, setModalTipo] = useState(null);
    const [procesoSeleccionado, setProcesoSeleccionado] = useState(null);
    const [notification, setNotification] = useState({ visible: false, mensaje: '', tipo: 'success' });
    const [mostrarAgregarProceso, setMostrarAgregarProceso] = useState(false);
    const [mostrarModalProductos, setMostrarModalProductos] = useState(false);
    const [mostrarDetalleInsumos, setMostrarDetalleInsumos] = useState(false);
    const [productoDetalleInsumos, setProductoDetalleInsumos] = useState(null);
    const [productosSeleccionados, setProductosSeleccionados] = useState([]);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [cantidadSeleccionada, setCantidadSeleccionada] = useState(1);
        const [productoEditandoReceta, setProductoEditandoReceta] = useState(null);
    const [mostrarModalRecetas, setMostrarModalRecetas] = useState(false);
    const [mostrarModalRecetaDetalle, setMostrarModalRecetaDetalle] = useState(false);
    const [recetaSeleccionada, setRecetaSeleccionada] = useState(null);


    
    function obtenerImagen(producto) {
    if (
        producto.imagen &&
        (producto.imagen.startsWith("/") || producto.imagen.startsWith("http"))
    ) {
        return producto.imagen;
    } else {
        return "https://source.unsplash.com/120x120/?" + encodeURIComponent(producto.nombre + " postre");
    }
    }
    // Estados para el formulario de producción
    const [procesoData, setProcesoData] = useState({
    nombreProduccion: '',
    fechaCreacion: new Date().toISOString().split('T')[0],
    fechaEntrega:   new Date().toISOString().split('T')[0],
    estadoProduccion: 'Empaquetando 🟠',
    estadoPedido: 'Abonado 🟣',
    numeroPedido: ''
    });

    // Mock de productos disponibles
    const productosDisponibles = [
  {
    id: 1,
    nombre: 'Mini Donas',
    imagen: 'https://www.gourmet.cl/wp-content/uploads/2014/06/donuts.jpg',
    insumos: [
      { cantidad: 2, unidad: 'kg', nombre: 'Harina' },
      { cantidad: 1, unidad: 'kg', nombre: 'Azúcar' },
      { cantidad: 6, unidad: 'unidades', nombre: 'Huevos' }
    ]
  },
  {
    id: 2,
    nombre: 'Fresas con Crema',
    imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLJpYaCsw9PrMPGeksePsJ11H1M3TICsywrg&s',
    insumos: [
      { cantidad: 500, unidad: 'g', nombre: 'Fresas' },
      { cantidad: 250, unidad: 'ml', nombre: 'Crema para batir' },
      { cantidad: 50, unidad: 'g', nombre: 'Azúcar glass' }
    ]
  },
  {
    id: 3,
    nombre: 'Pastel de Chocolate',
    imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRqBba-wH5E0DMJztvKWuifPz8CnGoLs0N1g&s',
    insumos: [
      { cantidad: 3, unidad: 'kg', nombre: 'Harina' },
      { cantidad: 1.5, unidad: 'kg', nombre: 'Chocolate' },
      { cantidad: 1, unidad: 'kg', nombre: 'Mantequilla' },
      { cantidad: 12, unidad: 'unidades', nombre: 'Huevos' }
    ]
  },
  {
    id: 4,
    nombre: 'Obleas',
    imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRX0_olEQJ1-IrfGe2hIdHZC5Aq1Kuh8vxKgg&s',
    insumos: [
      { cantidad: 1, unidad: 'paquete', nombre: 'Obleas' },
      { cantidad: 500, unidad: 'g', nombre: 'Arequipe' },
      { cantidad: 100, unidad: 'g', nombre: 'Queso rallado' }
    ]
  },
  {
    id: 5,
    nombre: 'Cupcakes',
    imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbXVXFGLuon_IjkR_ApTXv7dFsK0-YqRgxJw&s',
    insumos: [
      { cantidad: 2, unidad: 'kg', nombre: 'Harina' },
      { cantidad: 1, unidad: 'kg', nombre: 'Azúcar' },
      { cantidad: 1, unidad: 'kg', nombre: 'Mantequilla' },
      { cantidad: 10, unidad: 'unidades', nombre: 'Huevos' }
    ]
  },
  {
    id: 6,
    nombre: 'Arroz con Leche',
    imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJfttSCCVrpPKvtnKQKkBV8DT5Ttyrhq14EA&s',
    insumos: [
      { cantidad: 1, unidad: 'kg', nombre: 'Arroz' },
      { cantidad: 1, unidad: 'litro', nombre: 'Leche' },
      { cantidad: 200, unidad: 'g', nombre: 'Azúcar' },
      { cantidad: 1, unidad: 'rama', nombre: 'Canela' }
    ]
  },
  {
    id: 7,
    nombre: 'Sandwiches',
    imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyulfGIbEAHqvn3vVduMDhZXPsvHc9R451Sw&s',
    insumos: [
      { cantidad: 10, unidad: 'rebanadas', nombre: 'Pan' },
      { cantidad: 300, unidad: 'g', nombre: 'Jamón' },
      { cantidad: 300, unidad: 'g', nombre: 'Queso' },
      { cantidad: 200, unidad: 'g', nombre: 'Lechuga' }
    ]
  },
  {
    id: 8,
    nombre: 'Postres',
    imagen: 'https://i.ytimg.com/vi/2_FUW8y2J1M/maxresdefault.jpg',
    insumos: [
      { cantidad: 1, unidad: 'kg', nombre: 'Base de galleta' },
      { cantidad: 500, unidad: 'ml', nombre: 'Leche condensada' },
      { cantidad: 200, unidad: 'g', nombre: 'Frutas' }
    ]
  },
  {
    id: 9,
    nombre: 'Chocolates',
    imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSttL_Pp0gjjdhabEscWFHAs9_nc88F6d8bKg&s',
    insumos: [
      { cantidad: 1.5, unidad: 'kg', nombre: 'Cacao' },
      { cantidad: 1, unidad: 'kg', nombre: 'Azúcar' },
      { cantidad: 300, unidad: 'ml', nombre: 'Leche' }
    ]
  }
];


    const recetasDisponibles = [
        {
            id: 36,
            nombre: 'Torta de Chocolate con Café',
            pasos: ['Preparar mezcla con café', 'Hornear', 'Cubrir con ganache'],
            insumos: ['Harina', 'Café fuerte', 'Cacao', 'Azúcar', 'Huevos'],
            imagen: 'https://media.elgourmet.com/recetas/cover/1bdd8a837944f3a10abc33eeb9a036f8_3_3_photo.png'
        },
        {
        id: 37,
            nombre: 'Torta Red Velvet',
            pasos: ['Mezclar ingredientes con colorante rojo', 'Hornear', 'Cubrir con crema de queso'],
            insumos: ['Harina', 'Colorante rojo', 'Cacao', 'Vinagre', 'Queso crema'],
            imagen: 'https://media.elgourmet.com/recetas/cover/red-v_kvUtb7ixJqMHo63e5OnXWyjZsfV2zP.png'
        },
        {
            id: 32,
            nombre: 'Mini Donas con Azúcar y Canela',
            pasos: ['Freír donas', 'Pasar por mezcla de azúcar y canela'],
            insumos: ['Harina', 'Canela', 'Azúcar', 'Levadura', 'Huevos'],
            imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQeC4LnjzReB9EHRknBi99jxMEV1TCbh1IsCw&s'
        },
        {
            id: 33,
            nombre: 'Mini Donas Rellenas de Arequipe',
            pasos: ['Hacer donas pequeñas', 'Inyectar con arequipe', 'Decorar con azúcar glass'],
            insumos: ['Harina', 'Huevos', 'Arequipe', 'Azúcar glass'],
            imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNo-CAWDqoElUJXEFShS24aWE7VZi3CCX10A&s'
        },
        {
            id: 34,
            nombre: 'Obleas con Nutella y Fresas',
            pasos: ['Untar Nutella', 'Agregar fresas en rodajas', 'Cerrar la oblea'],
            insumos: ['Obleas', 'Nutella', 'Fresas frescas'],
            imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnRZm-QBk7z1HcweuEvGIJspabJcImf3mzzw&s'
        },
        {
            id: 35,
            nombre: 'Obleas con Queso y Miel',
            pasos: ['Agregar queso rallado', 'Rociar con miel de abejas', 'Servir fresca'],
            insumos: ['Obleas', 'Queso fresco', 'Miel de abejas'],
            imagen: 'https://thumbs.dreamstime.com/b/obleas-de-postre-colombianas-tradicionales-con-queso-fruta-y-salsa-caramelo-dulce-picada-tradicional-colombiano-219811662.jpg'
        },
        {
            id: 38,
            nombre: 'Fresas con Crema y Galleta',
            pasos: ['Colocar fresas en vaso', 'Agregar crema batida', 'Espolvorear galleta triturada'],
            insumos: ['Fresas', 'Crema de leche', 'Galleta María'],
            imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFzhVvkezQ69ngkBxtRgsySIVk_ovSiw6knQ&s'
        },
        {
            id: 39,
            nombre: 'Cupcakes de Limón con Merengue',
            pasos: ['Hornear cupcakes de limón', 'Decorar con merengue flameado'],
            insumos: ['Harina', 'Limón', 'Azúcar', 'Claras de huevo'],
            imagen: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiTQAWQv-QmMMpX4DYAOjoJtQ5UR0Io3lDpL7iq4emP5Gco4fonzZ4vcXGnvY7MJATPrcLqkfxij6LBL0OiDnYT_26QCAjjBQGZKs-3A2FX4-_RUWSBXzGHojEODq7ON6v1RXTahZDl07I4/s1600/Cupcakes+de+lim%25C3%25B3n+y+merengue.JPG'
        },{
            id: 40,
            nombre: 'Arroz con Leche y Coco',
            pasos: ['Cocer arroz', 'Agregar leche de coco y azúcar', 'Enfriar y servir'],
            insumos: ['Arroz', 'Leche de coco', 'Azúcar', 'Canela'],
            imagen: 'https://comopreparar.co/wp-content/uploads/2024/04/Delicioso-postre-Arroz-de-leche-de-coco-500x375.jpg'
        },
        {
            id: 41,
            nombre: 'Bombones de Chocolate Blanco con Fresa',
            pasos: ['Derretir chocolate blanco', 'Rellenar moldes con fresa', 'Refrigerar'],
            insumos: ['Chocolate blanco', 'Esencia de fresa', 'Colorante rosa'],
            imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEWe9y5x-O3i4Uq0pdYIpmbArKM0FOC7wBIw&s'
        },
        {
            id: 42,
            nombre: 'Postre de Galleta y Arequipe',
            pasos: ['Capas de galleta y arequipe', 'Refrigerar por 2 horas'],
            insumos: ['Galletas', 'Arequipe', 'Crema de leche'],
            imagen: 'https://ducales.com.co/wp-content/uploads/2019/01/receta-3.png'
        }
    ];


    useEffect(() => {
        const mockProcesos = [
            {
                id: 1,
                nombreProduccion: 'Producción #1',
                fechaCreacion: '01/06/2025',
                fechaEntrega: '05/06/2025',
                estadoProduccion: 'Empaquetando 🟠',
                estadoPedido: 'Abonado 🟣',
                numeroPedido: 'P-001',
                productos: [
                    { id: 3, nombre: 'Pastel de Chocolate', cantidad: 1, receta: recetasDisponibles[0] }
                ]
            },
            {
                id: 2,
                nombreProduccion: 'Producción #2',
                fechaCreacion: '02/06/2025',
                fechaEntrega: '06/06/2025',
                estadoProduccion: 'Empaquetando 🟠',
                estadoPedido: 'Abonado 🟣',
                numeroPedido: 'P-002',
                productos: [
                    { id: 1, nombre: 'Mini Donas', cantidad: 12, receta: recetasDisponibles[1] },
                    { id: 2, nombre: 'Fresas con Crema', cantidad: 6, receta: recetasDisponibles[2] }
                ]
            }
        ];
        setProcesos(mockProcesos);
    }, []);

    const showNotification = (mensaje, tipo = 'success') => {
        setNotification({ visible: true, mensaje, tipo });
    };

    const hideNotification = () => {
        setNotification({ visible: false, mensaje: '', tipo: 'success' });
    };

    const abrirModal = (tipo, proceso) => {
        setModalTipo(tipo);
        setProcesoSeleccionado(proceso);
        setModalVisible(true);
    };

    const cerrarModal = () => {
        setModalVisible(false);
        setProcesoSeleccionado(null);
        setModalTipo(null);
    };

    const abrirModalReceta = (producto) => {
        setProductoEditandoReceta(producto);
        setMostrarModalRecetas(true);
    };

    const cerrarModalRecetas = () => {
        setMostrarModalRecetas(false);
        setProductoEditandoReceta(null);
    };

    const abrirModalRecetaDetalle = (receta) => {
        setRecetaSeleccionada(receta);
        setMostrarModalRecetaDetalle(true);
    };

    const cerrarModalRecetaDetalle = () => {
        setMostrarModalRecetaDetalle(false);
        setRecetaSeleccionada(null);
    };

    const eliminarProceso = () => {
        const updated = procesos.filter(p => p.id !== procesoSeleccionado.id);
        setProcesos(updated);
        cerrarModal();
        showNotification('Proceso eliminado exitosamente');produccion.estado
    };

    // Función para actualizar el estado de un proceso
    const actualizarEstadoProceso = (procesoId, campo, valor) => {
        setProcesos(prev => 
            prev.map(proceso => 
                proceso.id === procesoId 
                    ? { ...proceso, [campo]: valor }
                    : proceso
            )
        );
        showNotification('Estado actualizado correctamente');
    };

    const procesosFiltrados = procesos.filter(p =>
        (p.nombreProduccion || '').toLowerCase().includes(filtro.toLowerCase())
    );

    const handleChange = (e) => {
        setProcesoData({...procesoData, [e.target.name]: e.target.value});
    };

    const estadoProduccion = procesoData.estadoProduccion || 'Empaquetando 🟠';
    const estadoPedido = procesoData.estadoPedido || 'Abonado 🟣';
    const fechaCreacion = procesoData.fechaCreacion || new Date().toISOString().split('T')[0];
    const fechaEntrega = procesoData.fechaEntrega || '05/06/2025';

    const agregarProducto = (producto) => {
        setProductosSeleccionados(prev => {
            const existe = prev.find(p => p.id === producto.id);
            if (existe) {
                const actualizados = prev.map(p =>
                    p.id === producto.id
                        ? { ...p, cantidad: p.cantidad + 1 }
                        : p
                );
                return actualizados;
            } else {
                const nuevos = [...prev, { ...producto, cantidad: 1, receta: null }];
                return nuevos;
            }
        });
    };

    const removeProducto = (id) => {
        setProductosSeleccionados(prev => prev.filter(item => item.id !== id));
        showNotification('Producto eliminado de la lista');
    };

    const cambiarCantidad = (id, nuevaCantidad) => {
        setProductosSeleccionados(prev =>
            prev.map(item =>
                item.id === id 
                    ? { ...item, cantidad: Math.max(1, nuevaCantidad) } 
                    : item
            )
        );
    };

    const verInsumosProducto = (producto) => {
        const productoCompleto = productosDisponibles.find(p => p.id === producto.id);
        setProductoDetalleInsumos(productoCompleto);
        setMostrarDetalleInsumos(true);
    };

    const guardarProceso = () => {
        if (productosSeleccionados.length === 0) {
            showNotification('Debe agregar al menos un producto al proceso.', 'error');
            return;
        }
        
    const sinReceta = productosSeleccionados.find(p => !p.receta);
        if (sinReceta) {
            showNotification(`El producto "${sinReceta.nombre}" no tiene receta asignada.`, 'error');
            return;
        }

    const nuevoProceso = {
    id: procesos.length + 1,
    nombreProduccion: procesoData.nombreProduccion,
    fechaCreacion,
    fechaEntrega,
    estadoProduccion,
    estadoPedido,
    productos: productosSeleccionados,
    numeroPedido: `P-${String(procesos.length + 1).padStart(3, '0')}`
    };

        setProcesos(prev => [...prev, nuevoProceso]);

        showNotification('Proceso guardado correctamente', 'success');

        
        
        // Resetear el formulario
        setProcesoData({
            nombreProduccion: '',
            fechaCreacion: '',
            fechaEntrega: '',
            estadoProduccion: 'Empaquetando 🟠',
            estadoPedido: 'Abonado 🟣',
            numeroPedido: ''
        });
        setProductosSeleccionados([]);
        setMostrarAgregarProceso(false);
    };

const estadosProduccion = [
    'Pendiente 🟡',
    'Empaquetando 🟠',
    'En producción 🔵',
    'Decorado 🟤',
    'Empaquetado 🟦',
    'Entregado 🟢',
    'N/A 🔴'
];

const estadospedido = [
    'Abonado 🟣',
    'Empaquetando 🟠',
    'En producción 🔵',
    'Decorado 🟤',
    'Empaquetado 🟦',
    'Entregado a ventas 🔵',
    'Entregado al cliente 🟢',
    'N/A 🔴'
];



const obtenerOpcionesEstadoProduccion = (estadoActual) => {
    const mapaTransiciones = {
        'Empaquetando 🟠':['Pendiente 🟡','Empaquetando 🟠','En producción 🔵'],
        'Pendiente 🟡': ['Pendiente 🟡','Empaquetando 🟠'],
        'En producción 🔵': ['En producción 🔵','Decorado 🟤'],
        'Decorado 🟤': ['Decorado 🟤','Empaquetado 🟦'],
        'Empaquetado 🟦': ['Empaquetado 🟦','Entregado 🟢'],
        'Entregado 🟢': ['Entregado 🟢'],
        'N/A 🔴': []
    };

    const siguientes = mapaTransiciones[estadoActual] || [];
    return [...siguientes, 'N/A 🔴'];
};


const obtenerOpcionesEstadopedido = (estadoActual) => {
    const mapaTransiciones = {
        'Abonado 🟣':['Abonado 🟣','Empaquetando 🟠'],
        'Empaquetando 🟠':['Abonado 🟣','Empaquetando 🟠','En producción 🔵'],
        'En producción 🔵': ['En producción 🔵','Decorado 🟤'],
        'Decorado 🟤':['Decorado 🟤','Empaquetado 🟦'],
        'Empaquetado 🟦': ['Empaquetado 🟦','Entregado a ventas 🔵','Entregado al cliente 🟢'],
        'Entregado a ventas 🔵': ['Entregado a ventas 🔵'],
        'Entregado al cliente 🟢': ['Entregado al cliente 🟢'],
        'N/A 🔴': []
    };

    const siguientes = mapaTransiciones[estadoActual] || [];
    return [...siguientes, 'N/A 🔴'];
};

    // Componente para renderizar selects editables en la tabla
const renderEstadoSelect = (rowData, campo) => {
  const estadoActual = rowData[campo];
  const esProduccion = campo === 'estadoProduccion';
  const esPedido = campo === 'estadoPedido';

  // Deshabilitar si es estado final o cancelado
  const deshabilitar = (
    (esProduccion && ['Entregado 🟢', 'N/A 🔴'].includes(estadoActual)) ||
    (esPedido && ['Entregado a ventas 🔵', 'Entregado al cliente 🟢', 'N/A 🔴'].includes(estadoActual))
  );

  return (
        <select
        value={estadoActual}
        onChange={(e) => actualizarEstadoProceso(rowData.id, campo, e.target.value)}
        disabled={deshabilitar}
        style={{
            width: '180px',
            padding: '4px',
            fontSize: '14px',
            border: 'none',
            appearance: 'none',
            background: 'transparent',
            color: deshabilitar ? '#888' : '#000',
            cursor: deshabilitar ? 'not-allowed' : 'pointer'
        }}
        >
      {(esProduccion
        ? obtenerOpcionesEstadoProduccion(estadoActual)
        : obtenerOpcionesEstadopedido(estadoActual)
      ).map((estado) => (
        <option key={estado} value={estado}>{estado}</option>
      ))}
    </select>
  );
}

    return (
        <div className="admin-wrapper">
            <Notification
                visible={notification.visible}
                mensaje={notification.mensaje}
                tipo={notification.tipo}
                onClose={hideNotification}
            />

            {!mostrarAgregarProceso ? (
                <>
                    <div className="admin-toolbar">
                        <button 
                            className="admin-button pink" 
                            onClick={() => setMostrarAgregarProceso(true)}
                            type="button"
                        >
                            + Agregar
                        </button>
                        <SearchBar 
                            placeholder="Buscar producción..." 
                            value={filtro} 
                            onChange={setFiltro} 
                        />
                    </div>
                    <h2 className="admin-section-title">Gestión de producción</h2>
                    <DataTable
                        value={procesosFiltrados}
                        className="admin-table"
                        paginator rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                    >
                        <Column 
                            header="N°" 
                            body={(rowData, { rowIndex }) => rowIndex + 1} 
                            style={{ width: '3rem', textAlign: 'center' }}
                        />
                        <Column field="nombreProduccion" header="Producción" />
                        <Column field="fechaCreacion" header="Fecha Creación" />
                        <Column field="fechaEntrega" header="Fecha Entrega" />
                        <Column 
                            header="Estado Producción" 
                            body={(rowData) => renderEstadoSelect(rowData, 'estadoProduccion')}
                        />
                        <Column 
                            header="Estado Pedido" 
                            body={(rowData) => renderEstadoSelect(rowData, 'estadoPedido')}
                        />
                        <Column field="numeroPedido" header="N° Pedido" />
                        <Column
                            header="Acción"
                            body={(rowData) => (
                                <>
                                    <button className="admin-button gray" title="Visualizar" onClick={() => abrirModal('visualizar', rowData)}>
                                        🔍
                                    </button>
                                    <button
                                        className="admin-button red"
                                        title="Eliminar"
                                        onClick={() => abrirModal('eliminar', rowData)}
                                    >🗑️</button>
                                </>
                            )}
                        />
                    </DataTable>
                        <Modal visible={modalVisible} onClose={cerrarModal}>
                        {modalTipo === 'visualizar' && procesoSeleccionado && (
                            <div>
                                    <h2 className="form-title">Detalle Proceso #{procesoSeleccionado.id}</h2>
                                    <div className="form-group">
                                        <label className="form-label">Producción</label>
                                        <input
                                        type="text"
                                        className="form-input"
                                        value={procesoSeleccionado.nombreProduccion}
                                        disabled
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                        <label className="form-label">Fecha Creación</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={procesoSeleccionado.fechaCreacion}
                                            disabled
                                        />
                                        </div>
                                        <div className="form-group">
                                        <label className="form-label">Fecha Entrega</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={procesoSeleccionado.fechaEntrega}
                                            disabled
                                        />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                        <label className="form-label">Estado Producción</label>
                                        {renderEstadoSelect(procesoSeleccionado, 'estadoProduccion')}
                                        </div>
                                        <div className="form-group">
                                        <label className="form-label">Estado Pedido</label>
                                        {renderEstadoSelect(procesoSeleccionado, 'estadoPedido')}
                                        </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">N° Pedido</label>
                                    <input
                                    type="text"
                                    className="form-input"
                                    value={procesoSeleccionado.numeroPedido}
                                    disabled
                                    />
                                </div>
                                
                                <h4>Productos:</h4>
                                <div style={{ maxHeight: '150px', overflowY: 'auto', marginTop: '10px' }}>
                                <table className="productos-table" style={{ width: '100%' }}>
                                    <thead>
                                    <tr>
                                        <th>Imagen</th>
                                        <th>Nombre</th>
                                        <th>Cantidad</th>
                                        <th>Receta</th>
                                        <th>Insumos</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {procesoSeleccionado.productos.map((producto) => {
                                        const productoCompleto = productosDisponibles.find(p => p.id === producto.id);
                                        return (
                                        <tr key={producto.id}>
                                            <td>
                                            <img 
                                                src={productoCompleto?.imagen || 'https://i.pinimg.com/736x/04/8f/4d/048f4d769ed7a2bced7360ab15c59561.jpg'} 
                                                alt={producto.nombre} 
                                                width="50" 
                                                height="50"
                                                style={{ objectFit: 'cover', borderRadius: '4px' }}
                                            />
                                            </td>
                                            <td>{producto.nombre}</td>
                                            <td>{producto.cantidad}</td>
                                            <td>
                                            {producto.receta ? (
                                                <button 
                                                className="btn-receta"
                                                onClick={() => abrirModalRecetaDetalle(producto.receta)}
                                                style={{ 
                                                    background: '#4CAF50', 
                                                    color: 'white', 
                                                    border: 'none', 
                                                    padding: '5px 10px', 
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                                >
                                                📖 {producto.receta.nombre}
                                                </button>
                                            ) : (
                                                <span style={{ color: '#999' }}>Sin receta</span>
                                            )}
                                            </td>
                                            <td>
                                            <button 
                                                className="btn-insumos"
                                                onClick={() => {
                                                const productoCompleto = productosDisponibles.find(p => p.id === producto.id);
                                                if (productoCompleto) {
                                                    setProductoDetalleInsumos(productoCompleto);
                                                    setMostrarDetalleInsumos(true);
                                                }
                                                }}
                                                style={{ 
                                                background: '#2196F3', 
                                                color: 'white', 
                                                border: 'none', 
                                                padding: '5px 10px', 
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                                }}
                                            >
                                                📋 Ver insumos
                                            </button>
                                            </td>
                                        </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                                </div>
                            </div>
                        )}
                        {modalTipo === 'eliminar' && (
                            <div>
                                <h3>¿Desea eliminar el proceso #{procesoSeleccionado?.id}?</h3>
                                <div className="modal-footer">
                                    <button className="modal-btn cancel-btn" onClick={cerrarModal}>Cancelar</button>
                                    <button className="modal-btn save-btn" onClick={eliminarProceso}>Eliminar</button>
                                </div>
                            </div>
                        )}
                    </Modal>


                    {mostrarModalRecetaDetalle && recetaSeleccionada && (
                        <Modal visible={mostrarModalRecetaDetalle} onClose={cerrarModalRecetaDetalle}>
                            <div className="receta-detalle-container">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                                    <img 
                                        src={recetaSeleccionada.imagen} 
                                        alt={recetaSeleccionada.nombre}
                                        width="80" 
                                        height="80"
                                        style={{ objectFit: 'cover', borderRadius: '8px' }}
                                    />
                                    <div>
                                        <h2 style={{ margin: '0 0 8px 0' }}>{recetaSeleccionada.nombre}</h2>
                                        <p style={{ margin: '0', color: '#666' }}>
                                            {recetaSeleccionada.insumos.length} insumos • {recetaSeleccionada.pasos.length} pasos
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <h3>📋 Insumos necesarios:</h3>
                                        <ul style={{ listStyle: 'none', padding: '0' }}>
                                            {recetaSeleccionada.insumos.map((insumo, index) => (
                                                <li key={index} style={{ 
                                                    padding: '8px', 
                                                    marginBottom: '4px', 
                                                    backgroundColor: '#f5f5f5', 
                                                    borderRadius: '4px' 
                                                }}>
                                                    • {insumo}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <h3>👩‍🍳 Pasos de preparación:</h3>
                                        <ol style={{ paddingLeft: '20px' }}>
                                            {recetaSeleccionada.pasos.map((paso, index) => (
                                                <li key={index} style={{ 
                                                    padding: '8px 0', 
                                                    marginBottom: '8px',
                                                    borderBottom: '1px solid #eee'
                                                }}>
                                                    {paso}
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                </div>

                                <div className="modal-footer" style={{ marginTop: '20px' }}>
                                    <button
                                        className="modal-btn cancel-btn"
                                        onClick={cerrarModalRecetaDetalle}
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        </Modal>
                    )}

                    {/* Modal para ver detalle de insumos desde visualización */}
                    {mostrarDetalleInsumos && productoDetalleInsumos && (
                        <Modal visible={mostrarDetalleInsumos} onClose={() => setMostrarDetalleInsumos(false)}>
                            <div className="insumos-modal-container">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                                    <img 
                                        src={productoDetalleInsumos.imagen} 
                                        alt={productoDetalleInsumos.nombre}
                                        width="80" 
                                        height="80"
                                        style={{ objectFit: 'cover', borderRadius: '8px' }}
                                    />
                                    <div>
                                        <h2 style={{ margin: '0 0 8px 0' }}>Insumos para: {productoDetalleInsumos.nombre}</h2>
                                        <p style={{ margin: '0', color: '#666' }}>
                                            {productoDetalleInsumos.insumos?.length || 0} insumos necesarios
                                        </p>
                                    </div>
                                </div>
                                
                                <table className="insumos-table" style={{ 
                                    width: '100%', 
                                    borderCollapse: 'collapse',
                                    marginTop: '20px'
                                }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                                            <th style={{ 
                                                padding: '12px', 
                                                textAlign: 'left', 
                                                borderBottom: '2px solid #dee2e6',
                                                fontWeight: 'bold'
                                            }}>Cantidad</th>
                                            <th style={{ 
                                                padding: '12px', 
                                                textAlign: 'left', 
                                                borderBottom: '2px solid #dee2e6',
                                                fontWeight: 'bold'
                                            }}>Unidad</th>
                                            <th style={{ 
                                                padding: '12px', 
                                                textAlign: 'left', 
                                                borderBottom: '2px solid #dee2e6',
                                                fontWeight: 'bold'
                                            }}>Insumo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productoDetalleInsumos.insumos?.map((insumo, index) => (
                                            <tr key={index} style={{ 
                                                borderBottom: '1px solid #dee2e6'
                                            }}>
                                                <td style={{ padding: '12px', fontWeight: 'bold', color: '#495057' }}>
                                                    {insumo.cantidad || 'N/A'}
                                                </td>
                                                <td style={{ padding: '12px', color: '#6c757d' }}>
                                                    {insumo.unidad || 'N/A'}
                                                </td>
                                                <td style={{ padding: '12px', color: '#212529' }}>
                                                    {insumo.nombre || insumo}
                                                </td>
                                            </tr>
                                        )) || (
                                            <tr>
                                                <td colSpan="3" style={{ padding: '12px', textAlign: 'center', color: '#6c757d' }}>
                                                    No hay insumos disponibles
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                
                                <div className="modal-footer" style={{ marginTop: '20px' }}>
                                    <button
                                        className="modal-btn cancel-btn"
                                        onClick={() => setMostrarDetalleInsumos(false)}
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        </Modal>
                    )}
                </>
            ) : (
                <div className="compra-form-container">
  <h1>Agregar Producción</h1>

  <form
    onSubmit={(e) => {
      e.preventDefault();
      guardarProceso();
    }}
  >
    <div className="compra-fields-grid">
      {/* Nombre de producción como datalist */}
      <div className="field-group">
        <label>Nombre de la producción</label>
        <input
          type="text"
          list="opcionesProduccion"
          name="nombreProduccion"
          value={procesoData.nombreProduccion}
          onChange={handleChange}
          className="modal-input"
          required
        />
        <datalist id="opcionesProduccion">
          {productosDisponibles.map(p => (
            <option key={p.id} value={p.nombre} />
          ))}
        </datalist>
      </div>

      {/* Fecha creación automática y bloqueada */}
      <div className="field-group">
        <label>Fecha de creación</label>
        <input
          type="date"
          className="modal-input"
          value={new Date().toISOString().split('T')[0]}
          disabled
        />
      </div>

      {/* Estado producción bloqueado */}
      <div className="field-group">
        <label>Estado de producción</label>
        <input
        type="text"
        className="modal-input"
        value={procesoData.estadoProduccion}
        disabled
        />
      </div>

      {/* Estado pedido bloqueado */}
      <div className="field-group">
        <label>Estado de pedido</label>
        <input
          type="text"
          className="modal-input"
          value="Abonado 🟣"
          disabled
        />
      </div>

      {/* Número del pedido (auto) */}
      <div className="field-group">
        <label>Número del pedido</label>
        <input
          type="text"
          className="modal-input"
          value={`P-${String(procesos.length + 1).padStart(3, '0')}`}
          disabled
        />
      </div>
    </div>

    {/* Botón para agregar productos */}
    <button
      type="button"
      className="modal-input"
      onClick={() => setMostrarModalProductos(true)}
    >
      ✚ Agregar productos
    </button>
                        {/* Lista de productos seleccionados */}
                        {productosSeleccionados.length > 0 && (
                            <div className="productos-seleccionados">
                                <h3>Productos agregados:</h3>
                                <table className="productos-table">
                                    <thead>
                                        <tr>
                                            <th>Imagen</th>
                                            <th>Nombre</th>
                                            <th>Cantidad</th>
                                            <th>Receta</th>
                                            <th>Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productosSeleccionados.map(item => {
                                            const productoCompleto = productosDisponibles.find(p => p.id === item.id);
                                            return (
                                                <tr key={item.id}>
                                                    <td>
                                                        <img 
                                                            src={productoCompleto?.imagen || 'https://via.placeholder.com/50'} 
                                                            alt={item.nombre} 
                                                            width="50" 
                                                            height="50"
                                                            style={{ objectFit: 'cover', borderRadius: '4px' }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <div>{item.nombre}</div>
                                                        {item.receta && <small style={{ fontSize: '12px', color: '#666' }}>📘 {item.receta.nombre}</small>}
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={item.cantidad}
                                                            onChange={(e) => cambiarCantidad(item.id, parseInt(e.target.value))}
                                                            style={{ width: '60px' }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <button 
                                                            type="button"
                                                            className="btn-insumos"
                                                            onClick={() => abrirModalReceta(item)}
                                                            style={{ 
                                                                background: '#4CAF50', 
                                                                color: 'white', 
                                                                border: 'none', 
                                                                padding: '5px 10px', 
                                                                borderRadius: '4px',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            📘 Ver recetas
                                                        </button>
                                                    </td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            className="btn-eliminar"
                                                            onClick={() => removeProducto(item.id)}
                                                            style={{ 
                                                                background: '#f44336', 
                                                                color: 'white', 
                                                                border: 'none', 
                                                                padding: '5px 10px', 
                                                                borderRadius: '4px',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="modal-footer">
                            <button
                                type="button"
                                className="modal-btn cancel-btn"
                                onClick={() => setMostrarAgregarProceso(false)}
                            >Cancelar</button>
                            <button className="modal-btn save-btn" type="submit">Guardar</button>
                            </div>
                        </form>

                    {/* Modal para agregar productos */}
            {mostrarModalProductos && (
                <Modal visible={mostrarModalProductos} onClose={() => setMostrarModalProductos(false)}>
                <ModalAgregarProductos
                    productosDisponibles={productosDisponibles}
                    productosSeleccionados={productosSeleccionados}
                    setProductosSeleccionados={setProductosSeleccionados}
                    filtro={filtro}
                    setFiltro={setFiltro}
                    onClose={() => setMostrarModalProductos(false)}
                />
                </Modal>

                )}


{mostrarModalRecetas && productoEditandoReceta && (
  <Modal visible={mostrarModalRecetas} onClose={() => setMostrarModalRecetas(false)}>
    <ModalRecetas
      productoEditandoReceta={productoEditandoReceta}
      recetasDisponibles={recetasDisponibles}
      setProductosSeleccionados={setProductosSeleccionados}
      setMostrarModalRecetas={setMostrarModalRecetas}
      setMostrarModalRecetaDetalle={setMostrarModalRecetaDetalle}
      setRecetaSeleccionada={setRecetaSeleccionada}
      showNotification={showNotification}
    />
  </Modal>
)}

{/* Modal para ver detalle de receta */}
{mostrarModalRecetaDetalle && recetaSeleccionada && (
  <Modal visible={mostrarModalRecetaDetalle} onClose={cerrarModalRecetaDetalle}>
    <ModalDetalleReceta receta={recetaSeleccionada} onClose={cerrarModalRecetaDetalle} />
  </Modal>
)}

{/* Modal para ver detalle de insumos */}
{mostrarDetalleInsumos && productoDetalleInsumos && (
  <Modal visible={mostrarDetalleInsumos} onClose={() => setMostrarDetalleInsumos(false)}>
    <ModalInsumos
      producto={productoDetalleInsumos}
      onClose={() => setMostrarDetalleInsumos(false)}
    />
  </Modal>
)}

                </div>
            )}
        </div>
    );
}