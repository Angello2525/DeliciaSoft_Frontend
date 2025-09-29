import { useState } from 'react';
import proveedorApiService from '../../../../services/proveedor_services';

export const useProveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [notification, setNotification] = useState({ visible: false, mensaje: '', tipo: 'success' });
  const [loading, setLoading] = useState(false);

  const showNotification = (mensaje, tipo = 'success') => {
    setNotification({ visible: true, mensaje, tipo });
  };

  const hideNotification = () => {
    setNotification({ visible: false, mensaje: '', tipo: 'success' });
  };

  const cargarProveedores = async () => {
    setLoading(true);
    try {
      const data = await proveedorApiService.obtenerProveedores();
      setProveedores(data);
    } catch (error) {
      console.error('Error cargando proveedores:', error);
      showNotification('Error al cargar los proveedores', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleEstado = async (proveedor) => {
    setLoading(true);
    try {
      console.log('🔄 Cambiando estado de proveedor:', proveedor);
      
      const idProveedor = proveedor.idProveedor || proveedor.idproveedor;
      
      await proveedorApiService.cambiarEstadoProveedor(idProveedor, !proveedor.estado);
      
      const updated = proveedores.map(p =>
        (p.idProveedor === idProveedor || p.idproveedor === idProveedor) ? { ...p, estado: !p.estado } : p
      );
      setProveedores(updated);
      showNotification(`Proveedor ${proveedor.estado ? 'desactivado' : 'activado'} exitosamente`);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      showNotification('Error al cambiar el estado del proveedor', 'error');
    } finally {
      setLoading(false);
    }
  };

  return {
    proveedores,
    setProveedores,
    filtro,
    setFiltro,
    notification,
    loading,
    setLoading,
    showNotification,
    hideNotification,
    cargarProveedores,
    toggleEstado
  };
};