import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import '../../adminStyles.css';
import Modal from '../../components/modal';
import SearchBar from '../../components/SearchBar';
import Notification from '../../components/Notification';
import UsuariosForm from './components/UsuariosForm'; // Import the new component

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [notification, setNotification] = useState({ visible: false, mensaje: '', tipo: 'success' });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTipo, setModalTipo] = useState(null);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  
  useEffect(() => {
    const mockUsuarios = [
      { 
        id: 1, 
        nombres: 'Juan Carlos', 
        apellidos: 'Pérez García',
        correo: 'juan@gmail.com', 
        contraseña: '123456',
        rol_id: 1, 
        rol_nombre: 'Administrador',
        tipo_documento_id: 1,
        tipo_documento_nombre: 'Cédula de Ciudadanía',
        documento: '12345678',
        activo: true 
      },
      { 
        id: 2, 
        nombres: 'María Elena', 
        apellidos: 'García López',
        correo: 'maria@gmail.com', 
        contraseña: '123456',
        rol_id: 2, 
        rol_nombre: 'Repostero',
        tipo_documento_id: 1,
        tipo_documento_nombre: 'Cédula de Ciudadanía',
        documento: '87654321',
        activo: true 
      },
      { 
        id: 3, 
        nombres: 'Carlos Alberto', 
        apellidos: 'Rodríguez Martínez',
        correo: 'carlos@gmail.com', 
        contraseña: '123456',
        rol_id: 3, 
        rol_nombre: 'Decorador',
        tipo_documento_id: 2,
        tipo_documento_nombre: 'Cédula de Extranjería',
        documento: '11223344',
        activo: false 
      },
      { 
        id: 4, 
        nombres: 'Ana Patricia', 
        apellidos: 'Martínez Hernández',
        correo: 'ana@gmail.com', 
        contraseña: '123456',
        rol_id: 2, 
        rol_nombre: 'Repostero',
        tipo_documento_id: 1,
        tipo_documento_nombre: 'Cédula de Ciudadanía',
        documento: '55667788',
        activo: true 
      },
      { 
        id: 5, 
        nombres: 'Luis Fernando', 
        apellidos: 'Fernández Silva',
        correo: 'luis@gmail.com', 
        contraseña: '123456',
        rol_id: 1, 
        rol_nombre: 'Administrador',
        tipo_documento_id: 3,
        tipo_documento_nombre: 'Pasaporte',
        documento: 'AB123456',
        activo: true 
      }
    ];

    const mockRoles = [
      { id: 1, nombre: 'Administrador' },
      { id: 2, nombre: 'Repostero' },
      { id: 3, nombre: 'Decorador' },
      { id: 4, nombre: 'Vendedor' }
    ];

    const mockTiposDocumento = [
      { id: 1, nombre: 'Cédula de Ciudadanía' },
      { id: 2, nombre: 'Cédula de Extranjería' },
      { id: 3, nombre: 'Pasaporte' },
      { id: 4, nombre: 'NIT' }
    ];

    setUsuarios(mockUsuarios);
    setRoles(mockRoles);
    setTiposDocumento(mockTiposDocumento);
  }, []);

  const toggleActivo = (usuario) => {
    const updated = usuarios.map(usr =>
      usr.id === usuario.id ? { ...usr, activo: !usr.activo } : usr
    );
    setUsuarios(updated);
    showNotification(`Usuario ${usuario.activo ? 'desactivado' : 'activado'} exitosamente`);
  };

  const showNotification = (mensaje, tipo = 'success') => {
    setNotification({ visible: true, mensaje, tipo });
  };

  const hideNotification = () => {
    setNotification({ visible: false, mensaje: '', tipo: 'success' });
  };

  const abrirModal = (tipo, usuario = null) => {
    // Bloquear edición y eliminación si el usuario está desactivado
    if ((tipo === 'editar' || tipo === 'eliminar') && usuario && !usuario.activo) {
      showNotification('No se puede realizar esta acción en un usuario desactivado', 'error');
      return;
    }
    
    setModalTipo(tipo);
    setUsuarioSeleccionado(usuario);
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setUsuarioSeleccionado(null);
    setModalTipo(null);
  };

  const guardarUsuario = (formData) => {
    const rolSeleccionado = roles.find(r => r.id === parseInt(formData.rol_id));
    const tipoDocumentoSeleccionado = tiposDocumento.find(td => td.id === parseInt(formData.tipo_documento_id));
    
    if (modalTipo === 'agregar') {
      const nuevoId = usuarios.length ? Math.max(...usuarios.map(u => u.id)) + 1 : 1;
      const nuevoUsuario = {
        ...formData,
        id: nuevoId,
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        correo: formData.correo.trim().toLowerCase(),
        documento: formData.documento.trim(),
        rol_id: parseInt(formData.rol_id),
        rol_nombre: rolSeleccionado.nombre,
        tipo_documento_id: parseInt(formData.tipo_documento_id),
        tipo_documento_nombre: tipoDocumentoSeleccionado.nombre
      };
      
      delete nuevoUsuario.confirmarContraseña;
      
      setUsuarios([...usuarios, nuevoUsuario]);
      showNotification('Usuario agregado exitosamente');
    } else if (modalTipo === 'editar') {
      const updated = usuarios.map(usr =>
        usr.id === usuarioSeleccionado.id 
          ? { 
              ...usr, 
              ...formData,
              nombres: formData.nombres.trim(),
              apellidos: formData.apellidos.trim(),
              correo: formData.correo.trim().toLowerCase(),
              documento: formData.documento.trim(),
              rol_id: parseInt(formData.rol_id), 
              rol_nombre: rolSeleccionado.nombre,
              tipo_documento_id: parseInt(formData.tipo_documento_id),
              tipo_documento_nombre: tipoDocumentoSeleccionado.nombre
            }
          : usr
      );
      setUsuarios(updated);
      showNotification('Usuario actualizado exitosamente');
    }
    
    cerrarModal();
  };

  const confirmarEliminar = () => {
    const updated = usuarios.filter(usr => usr.id !== usuarioSeleccionado.id);
    setUsuarios(updated);
    cerrarModal();
    showNotification('Usuario eliminado exitosamente');
  };

  const usuariosFiltrados = usuarios.filter(usr =>
    usr.id.toString().includes(filtro.toLowerCase()) ||
    usr.nombres.toLowerCase().includes(filtro.toLowerCase()) ||
    usr.apellidos.toLowerCase().includes(filtro.toLowerCase()) ||
    usr.correo.toLowerCase().includes(filtro.toLowerCase()) ||
    usr.rol_nombre.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="admin-wrapper">
      <Notification
        visible={notification.visible}
        mensaje={notification.mensaje}
        tipo={notification.tipo}
        onClose={hideNotification}
      />

      <div className="admin-toolbar">
        <button
          className="admin-button pink"
          onClick={() => abrirModal('agregar')}
          type="button"
        >
          + Agregar 
        </button>
        <SearchBar
          placeholder="Buscar usuario..."
          value={filtro}
          onChange={setFiltro}
        />
      </div>

      <h2 className="admin-section-title">Usuarios</h2>
      <DataTable
        value={usuariosFiltrados}
        className="admin-table"
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 25, 50]}
        tableStyle={{ minWidth: '50rem' }}
      >
        <Column 
          header="N°" 
          body={(rowData, { rowIndex }) => rowIndex + 1} 
          style={{ width: '3rem', textAlign: 'center' }}
          headerStyle={{ paddingLeft: '1rem' }}
        />
        <Column 
          field="nombres" 
          header="Nombres" 
          headerStyle={{ paddingLeft: '2.5rem' }}
        />
        <Column 
          field="apellidos" 
          header="Apellidos" 
          headerStyle={{ paddingLeft: '4rem' }}
        />
        <Column 
          field="correo" 
          header="Correo" 
          headerStyle={{ paddingLeft: '4rem' }}
        />
        <Column 
          field="rol_nombre" 
          header="Rol" 
          headerStyle={{ paddingLeft: '3.5rem' }}
        />
        <Column
          header="Estado"
          headerStyle={{ paddingLeft: '1rem' }}
          body={(rowData) => (
            <InputSwitch
              checked={rowData.activo}
              onChange={() => toggleActivo(rowData)}
            />
          )}
        />
        <Column
          header="Acciones"
          headerStyle={{ paddingLeft: '3rem' }}
          body={(rowData) => (
            <>
            <button 
                className="admin-button gray" 
                title="Visualizar" 
                onClick={() => abrirModal('visualizar', rowData)}
              >
                🔍
              </button>
              <button
                className={`admin-button yellow ${!rowData.activo ? 'disabled' : ''}`}
                title={!rowData.activo ? "Usuario desactivado" : "Editar"}
                onClick={() => abrirModal('editar', rowData)}
                disabled={!rowData.activo}
              >
                ✏️
              </button>
              <button
                className={`admin-button red ${!rowData.activo ? 'disabled' : ''}`}
                title={!rowData.activo ? "Usuario desactivado" : "Eliminar"}
                onClick={() => abrirModal('eliminar', rowData)}
                disabled={!rowData.activo}
              >
                🗑️
              </button>
            </>
          )}
        />
      </DataTable>

      {/* Modal Agregar/Editar con el nuevo formulario */}
       {(modalTipo === 'agregar' || modalTipo === 'editar' || modalTipo === 'visualizar') && modalVisible && (
      <Modal visible={modalVisible} onClose={cerrarModal}>
        <h2 className="modal-title modal-title-compact">
          {modalTipo === 'agregar' ? 'Agregar Usuario' : modalTipo === 'editar' ? 'Editar Usuario' : 'Detalles del Usuario'}
        </h2>
        <UsuariosForm
          modalTipo={modalTipo} // Esto hará que UsuariosForm sepa si es 'visualizar'
          usuarioSeleccionado={usuarioSeleccionado}
          roles={roles}
          tiposDocumento={tiposDocumento}
          usuarios={usuarios}
          onSave={guardarUsuario}
          onCancel={cerrarModal}
          setNotification={setNotification}
        />
      </Modal>
    )}

      {modalTipo === 'eliminar' && modalVisible && (
        <Modal visible={modalVisible} onClose={cerrarModal}>
          <h2 className="modal-title modal-title-compact">Confirmar Eliminación</h2>
          <div className="modal-body modal-body-compact">
            <p>¿Está seguro de que desea eliminar al usuario <strong>{usuarioSeleccionado?.nombres} {usuarioSeleccionado?.apellidos}</strong>?</p>
          </div>
          <div className="modal-footer">
            <button className="modal-btn cancel-btn" onClick={cerrarModal}>Cancelar</button>
              <button className="modal-btn save-btn" onClick={confirmarEliminar}>Eliminar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}