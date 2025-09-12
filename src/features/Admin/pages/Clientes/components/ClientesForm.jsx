import React, { useState, useEffect } from 'react';
import { InputSwitch } from 'primereact/inputswitch';
import GoogleAddressAutocomplete from '../../../../../shared/components/GoogleAddressAutocomplete';

// Función para validar contraseña con requisitos de seguridad
const validarContrasena = (contrasena) => {
    const errores = [];

    if (contrasena.length < 8) {
        errores.push('Debe tener al menos 8 caracteres.');
    }

    if (!/[A-Z]/.test(contrasena)) {
        errores.push('Debe contener al menos una letra mayúscula.');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(contrasena)) {
        errores.push('Debe contener al menos un carácter especial.');
    }

    return errores;
};

// Función para prevenir espacios al inicio
const preventLeadingSpaces = (value) => {
    return value.replace(/^\s+/, '');
};

// Función para validar direcciones reales colombianas
const validarDireccionReal = (direccion) => {
    if (!direccion || direccion.trim().length === 0) {
        return false;
    }
    
    // Patrones para direcciones válidas en Colombia
    const patronesDireccion = [
        /^(cra?\.?|carrera)\s*\d+[a-z]?\s*#?\s*\d+/i,         // Carrera o Cra
        /^(calle?|cl\.?)\s*\d+[a-z]?\s*#?\s*\d+/i,          // Calle o Cl
        /^(kr?\.?|carrera)\s*\d+[a-z]?\s*#?\s*\d+/i,        // Kr (abreviación de carrera)
        /^(av\.?|avenida)\s*\d+[a-z]?\s*#?\s*\d+/i,         // Avenida o Av
        /^(diagonal|diag\.?)\s*\d+[a-z]?\s*#?\s*\d+/i,      // Diagonal
        /^(transversal|tv\.?)\s*\d+[a-z]?\s*#?\s*\d+/i,     // Transversal
        /^(autopista|aut\.?)\s/i,                            // Autopista
        /^(via|vía)\s/i                                      // Vía
    ];
    
    return patronesDireccion.some(patron => patron.test(direccion.trim()));
};

export default function ClienteFormModal({
    visible,
    onClose,
    modalTipo,
    clienteSeleccionado,
    clientes,
    onSave,
    showNotification
}) {
    const [formData, setFormData] = useState({
        tipoDocumento: 'CC',
        numeroDocumento: '',
        nombre: '',
        apellido: '',
        correo: '',
        contrasena: '',
        confirmarContrasena: '',
        direccion: '',
        barrio: '',
        ciudad: '',
        fechaNacimiento: '',
        celular: '',
        estado: true
    });

    const [formErrors, setFormErrors] = useState({
        numeroDocumento: '',
        nombre: '',
        apellido: '',
        correo: '',
        contrasena: '',
        confirmarContrasena: '',
        celular: '',
        fechaNacimiento: '',
        direccion: ''
    });

    const [mostrarContrasena, setMostrarContrasena] = useState(false);
    const [mostrarConfirmarContrasena, setMostrarConfirmarContrasena] = useState(false);

    // Determinar si es modo de solo lectura
    const isReadOnly = modalTipo === 'visualizar';

    useEffect(() => {
        // Reset form and errors when modal opens or client changes
        if (visible) {
            setFormErrors({
                numeroDocumento: '',
                nombre: '',
                apellido: '',
                correo: '',
                contrasena: '',
                confirmarContrasena: '',
                celular: '',
                fechaNacimiento: '',
                direccion: ''
            });

            if (modalTipo === 'agregar') {
                setFormData({
                    tipoDocumento: 'CC',
                    numeroDocumento: '',
                    nombre: '',
                    apellido: '',
                    correo: '',
                    contrasena: '',
                    confirmarContrasena: '',
                    direccion: '',
                    barrio: '',
                    ciudad: '',
                    fechaNacimiento: '',
                    celular: '',
                    estado: true
                });
            } else if ((modalTipo === 'editar' || modalTipo === 'visualizar') && clienteSeleccionado) {
                setFormData({
                    tipoDocumento: clienteSeleccionado.tipoDocumento,
                    numeroDocumento: clienteSeleccionado.numeroDocumento,
                    nombre: clienteSeleccionado.nombre,
                    apellido: clienteSeleccionado.apellido,
                    correo: clienteSeleccionado.correo,
                    contrasena: clienteSeleccionado.contrasena,
                    confirmarContrasena: '',
                    direccion: clienteSeleccionado.direccion,
                    barrio: clienteSeleccionado.barrio,
                    ciudad: clienteSeleccionado.ciudad,
                    fechaNacimiento: clienteSeleccionado.fechaNacimiento,
                    celular: clienteSeleccionado.celular,
                    estado: clienteSeleccionado.estado
                });
            }
            setMostrarContrasena(false);
            setMostrarConfirmarContrasena(false);
        }
    }, [visible, modalTipo, clienteSeleccionado]);

    const handleInputChange = (field, value) => {
        if (isReadOnly) return;

        let error = '';
        let processedValue = value;

        // Prevenir espacios al inicio en todos los campos de texto
        if (typeof value === 'string' && field !== 'contrasena' && field !== 'confirmarContrasena') {
            processedValue = preventLeadingSpaces(value);
        }

        switch (field) {
            case 'numeroDocumento':
                if (!/^\d*$/.test(processedValue)) {
                    error = 'Solo se permiten números.';
                    processedValue = formData.numeroDocumento;
                } else {
                    if (!processedValue.trim()) {
                        error = 'El número de documento es obligatorio.';
                    } else {
                        const documentoExiste = clientes.some(c =>
                            c.numeroDocumento === processedValue &&
                            (modalTipo === 'agregar' || c.idCliente !== clienteSeleccionado?.idCliente)
                        );
                        if (documentoExiste) {
                            error = 'Ya existe un cliente con este número.';
                        }
                    }
                }
                break;
            case 'nombre':
                if (!processedValue.trim()) {
                    error = 'El nombre es obligatorio.';
                } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(processedValue)) {
                    error = 'Solo se permiten letras.';
                }
                break;
            case 'apellido':
                if (!processedValue.trim()) {
                    error = 'El apellido es obligatorio.';
                } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(processedValue)) {
                    error = 'Solo se permiten letras.';
                }
                break;
            case 'correo':
                if (!processedValue.trim()) {
                    error = 'El correo es obligatorio.';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(processedValue)) {
                    error = 'Formato de correo no válido.';
                }
                break;
            case 'celular':
                if (!/^\d*$/.test(processedValue)) {
                    error = 'Solo se permiten números.';
                    processedValue = formData.celular;
                } else {
                    if (!processedValue.trim()) {
                        error = 'El celular es obligatorio.';
                    }
                }
                break;
            case 'contrasena':
                // No aplicar preventLeadingSpaces a contraseñas
                if (modalTipo === 'agregar' || (modalTipo === 'editar' && value.trim())) {
                    const erroresContrasena = validarContrasena(value);
                    if (erroresContrasena.length > 0) {
                        error = erroresContrasena[0];
                    }
                }
                processedValue = value; // Mantener el valor original sin modificar espacios
                break;
            case 'confirmarContrasena':
                processedValue = value; // Mantener el valor original sin modificar espacios
                if (modalTipo === 'agregar') {
                    if (value.trim() && formData.contrasena !== value) {
                        error = 'Las contraseñas no coinciden.';
                    } else if (!value.trim() && formData.contrasena.trim()) {
                        error = 'Debe confirmar la contraseña.';
                    }
                }
                break;
            case 'fechaNacimiento':
                if (processedValue) {
                    const fechaNac = new Date(processedValue);
                    const fechaActual = new Date();
                    const edad = fechaActual.getFullYear() - fechaNac.getFullYear();
                    const mesActual = fechaActual.getMonth();
                    const mesNacimiento = fechaNac.getMonth();

                    let edadFinal = edad;
                    if (mesActual < mesNacimiento || (mesActual === mesNacimiento && fechaActual.getDate() < fechaNac.getDate())) {
                        edadFinal--;
                    }

                    if (edadFinal < 13) {
                        error = 'El cliente debe tener al menos 13 años.';
                    }
                }
                break;
            case 'direccion':
                if (!processedValue.trim()) {
                    error = 'La dirección es obligatoria.';
                } else if (!validarDireccionReal(processedValue)) {
                    error = 'Ingrese una dirección válida (ej: Cra 51a #71-25, Calle 45 #23-12)';
                }
                break;
            default:
                break;
        }

        setFormData(prev => ({ ...prev, [field]: processedValue }));
        setFormErrors(prev => ({ ...prev, [field]: error }));

        // Special handling for confirmarContrasena error when contrasena changes in 'agregar' mode
        if (modalTipo === 'agregar' && field === 'contrasena') {
            if (formData.confirmarContrasena && value !== formData.confirmarContrasena) {
                setFormErrors(prev => ({ ...prev, confirmarContrasena: 'Las contraseñas no coinciden.' }));
            } else if (formData.confirmarContrasena && value === formData.confirmarContrasena) {
                setFormErrors(prev => ({ ...prev, confirmarContrasena: '' }));
            }
        }
    };

    const validarFormularioCompleto = () => {
        const newErrors = {};
        let isValid = true;
        const { numeroDocumento, nombre, apellido, correo, celular, contrasena, confirmarContrasena, fechaNacimiento, direccion } = formData;

        if (!numeroDocumento.trim()) {
            newErrors.numeroDocumento = 'El número de documento es obligatorio.';
            isValid = false;
        } else if (!/^\d+$/.test(numeroDocumento)) {
            newErrors.numeroDocumento = 'Solo se permiten números.';
            isValid = false;
        } else {
            const documentoExiste = clientes.some(c =>
                c.numeroDocumento === numeroDocumento &&
                (modalTipo === 'agregar' || c.idCliente !== clienteSeleccionado?.idCliente)
            );
            if (documentoExiste) {
                newErrors.numeroDocumento = 'Ya existe un cliente con este número de documento.';
                isValid = false;
            }
        }

        if (!nombre.trim()) {
            newErrors.nombre = 'El nombre es obligatorio.';
            isValid = false;
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre)) {
            newErrors.nombre = 'Solo se permiten letras y espacios.';
            isValid = false;
        }

        if (!apellido.trim()) {
            newErrors.apellido = 'El apellido es obligatorio.';
            isValid = false;
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(apellido)) {
            newErrors.apellido = 'Solo se permiten letras y espacios.';
            isValid = false;
        }

        if (!correo.trim()) {
            newErrors.correo = 'El correo es obligatorio.';
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
            newErrors.correo = 'El formato del correo no es válido.';
            isValid = false;
        }

        if (!celular.trim()) {
            newErrors.celular = 'El celular es obligatorio.';
            isValid = false;
        } else if (!/^\d+$/.test(celular)) {
            newErrors.celular = 'Solo se permiten números.';
            isValid = false;
        }

        // Validar dirección
        if (!direccion.trim()) {
            newErrors.direccion = 'La dirección es obligatoria.';
            isValid = false;
        } else if (!validarDireccionReal(direccion)) {
            newErrors.direccion = 'Ingrese una dirección válida (ej: Cra 51a #71-25, Calle 45 #23-12)';
            isValid = false;
        }

        // Password validation logic
        if (modalTipo === 'agregar') {
            if (!contrasena.trim()) {
                newErrors.contrasena = 'La contraseña es obligatoria.';
                isValid = false;
            } else {
                const erroresContrasena = validarContrasena(contrasena);
                if (erroresContrasena.length > 0) {
                    newErrors.contrasena = erroresContrasena[0];
                    isValid = false;
                }
            }

            if (!confirmarContrasena.trim()) {
                newErrors.confirmarContrasena = 'Debe confirmar la contraseña.';
                isValid = false;
            } else if (contrasena !== confirmarContrasena) {
                newErrors.confirmarContrasena = 'Las contraseñas no coinciden.';
                isValid = false;
            }
        } else if (modalTipo === 'editar') {
            if (contrasena.trim()) {
                const erroresContrasena = validarContrasena(contrasena);
                if (erroresContrasena.length > 0) {
                    newErrors.contrasena = erroresContrasena[0];
                    isValid = false;
                }
            }
        }

        if (fechaNacimiento) {
            const fechaNac = new Date(fechaNacimiento);
            const fechaActual = new Date();
            const edad = fechaActual.getFullYear() - fechaNac.getFullYear();
            const mesActual = fechaActual.getMonth();
            const mesNacimiento = fechaNac.getMonth();

            let edadFinal = edad;
            if (mesActual < mesNacimiento || (mesActual === mesNacimiento && fechaActual.getDate() < fechaNac.getDate())) {
                edadFinal--;
            }

            if (edadFinal < 13) {
                newErrors.fechaNacimiento = 'El cliente debe tener al menos 13 años.';
                isValid = false;
            }
        }

        setFormErrors(newErrors);
        return isValid;
    };

    const handleSave = () => {
        if (!validarFormularioCompleto()) {
            showNotification('Por favor, corrige los errores del formulario.', 'error');
            return;
        }
        onSave(formData);
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return '';
        return new Date(fecha).toLocaleDateString('es-ES');
    };

    // Función para obtener el título del modal
    const getTitleModal = () => {
        switch(modalTipo) {
            case 'agregar': return 'Agregar Cliente';
            case 'editar': return 'Editar Cliente';
            case 'visualizar': return 'Detalles del Cliente';
            default: return 'Cliente';
        }
    };

    // Estilos básicos para el modal
    const modalOverlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
    };

    const modalContentStyle = {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        minWidth: '500px',
        maxWidth: '90%',
        maxHeight: '90%',
        overflowY: 'auto'
    };

    return (
        visible && (
            <div style={modalOverlayStyle}>
                <div style={modalContentStyle}>
                    <h2 className="modal-title text-base">
                        {getTitleModal()}
                    </h2>

                    <div className="modal-body">
                        <div style={{ display: 'grid', gridTemplateColumns: '0.50fr 0.50fr', gap: '0.25rem', width: '100%', minWidth: '500px' }}>

                            <div className="modal-field">
                                <label className="text-sm" style={{ fontSize: '12px', marginBottom: '2px', display: 'block' }}>
                                    Tipo de Documento: <span style={{ color: 'red' }}>*</span>
                                </label>
                                <select
                                    value={formData.tipoDocumento}
                                    onChange={(e) => handleInputChange('tipoDocumento', e.target.value)}
                                    className="modal-input text-sm p-1"
                                    style={{ 
                                        width: '100%', 
                                        height: '28px', 
                                        fontSize: '12px', 
                                        padding: '2px 4px',
                                        backgroundColor: isReadOnly ? '#f5f5f5' : 'white',
                                        color: isReadOnly ? '#666' : 'black'
                                    }}
                                    disabled={isReadOnly}
                                >
                                    <option value="CC">Cédula de Ciudadanía</option>
                                    <option value="TI">Tarjeta de Identidad</option>
                                    <option value="CE">Cédula de Extranjería</option>
                                    <option value="PA">Pasaporte</option>
                                </select>
                            </div>

                            <div className="modal-field">
                                <label className="text-sm" style={{ fontSize: '12px', marginBottom: '2px', display: 'block' }}>
                                    N° Documento: <span style={{ color: 'red' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.numeroDocumento}
                                    onChange={(e) => handleInputChange('numeroDocumento', e.target.value)}
                                    className="modal-input text-sm p-1"
                                    style={{
                                        width: '100%', 
                                        height: '28px', 
                                        fontSize: '12px', 
                                        padding: '2px 4px',
                                        borderColor: formErrors.numeroDocumento ? 'red' : '',
                                        backgroundColor: isReadOnly ? '#f5f5f5' : 'white',
                                        color: isReadOnly ? '#666' : 'black'
                                    }}
                                    maxLength={10}
                                    readOnly={isReadOnly}
                                />
                                {formErrors.numeroDocumento && !isReadOnly && (
                                    <small style={{ color: 'red', fontSize: '10px' }}>{formErrors.numeroDocumento}</small>
                                )}
                            </div>

                            <div className="modal-field">
                                <label className="text-sm" style={{ fontSize: '12px', marginBottom: '2px', display: 'block' }}>
                                    Nombre: <span style={{ color: 'red' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                                    className="modal-input text-sm p-1"
                                    style={{
                                        width: '100%', 
                                        height: '28px', 
                                        fontSize: '12px', 
                                        padding: '2px 4px',
                                        borderColor: formErrors.nombre ? 'red' : '',
                                        backgroundColor: isReadOnly ? '#f5f5f5' : 'white',
                                        color: isReadOnly ? '#666' : 'black'
                                    }}
                                    maxLength={15}
                                    readOnly={isReadOnly}
                                />
                                {formErrors.nombre && !isReadOnly && (
                                    <small style={{ color: 'red', fontSize: '10px' }}>{formErrors.nombre}</small>
                                )}
                            </div>

                            <div className="modal-field">
                                <label className="text-sm" style={{ fontSize: '12px', marginBottom: '2px', display: 'block' }}>
                                    Apellido: <span style={{ color: 'red' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.apellido}
                                    onChange={(e) => handleInputChange('apellido', e.target.value)}
                                    className="modal-input text-sm p-1"
                                    style={{
                                        width: '100%', 
                                        height: '28px', 
                                        fontSize: '12px', 
                                        padding: '2px 4px',
                                        borderColor: formErrors.apellido ? 'red' : '',
                                        backgroundColor: isReadOnly ? '#f5f5f5' : 'white',
                                        color: isReadOnly ? '#666' : 'black'
                                    }}
                                    maxLength={15}
                                    readOnly={isReadOnly}
                                />
                                {formErrors.apellido && !isReadOnly && (
                                    <small style={{ color: 'red', fontSize: '10px' }}>{formErrors.apellido}</small>
                                )}
                            </div>

                            <div className="modal-field">
                                <label className="text-sm" style={{ fontSize: '12px', marginBottom: '2px', display: 'block' }}>
                                    Correo: <span style={{ color: 'red' }}>*</span>
                                </label>
                                <input
                                    type="email"
                                    value={formData.correo}
                                    onChange={(e) => handleInputChange('correo', e.target.value)}
                                    className="modal-input text-sm p-1"
                                    style={{
                                        width: '100%', 
                                        height: '28px', 
                                        fontSize: '12px', 
                                        padding: '2px 4px',
                                        borderColor: formErrors.correo ? 'red' : '',
                                        backgroundColor: isReadOnly ? '#f5f5f5' : 'white',
                                        color: isReadOnly ? '#666' : 'black'
                                    }}
                                    maxLength={20}
                                    readOnly={isReadOnly}
                                />
                                {formErrors.correo && !isReadOnly && (
                                    <small style={{ color: 'red', fontSize: '10px' }}>{formErrors.correo}</small>
                                )}
                            </div>

                            <div className="modal-field">
                                <label className="text-sm" style={{ fontSize: '12px', marginBottom: '2px', display: 'block' }}>
                                    Celular: <span style={{ color: 'red' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.celular}
                                    onChange={(e) => handleInputChange('celular', e.target.value)}
                                    className="modal-input text-sm p-1"
                                    style={{
                                        width: '100%', 
                                        height: '28px', 
                                        fontSize: '12px', 
                                        padding: '2px 4px',
                                        borderColor: formErrors.celular ? 'red' : '',
                                        backgroundColor: isReadOnly ? '#f5f5f5' : 'white',
                                        color: isReadOnly ? '#666' : 'black'
                                    }}
                                    maxLength={10}
                                    readOnly={isReadOnly}
                                />
                                {formErrors.celular && !isReadOnly && (
                                    <small style={{ color: 'red', fontSize: '10px' }}>{formErrors.celular}</small>
                                )}
                            </div>

                            {/* Contraseña field */}
                            <div className="modal-field">
                                <label className="text-sm" style={{ fontSize: '12px', marginBottom: '2px', display: 'block' }}>
                                    Contraseña: {modalTipo === 'agregar' && <span style={{ color: 'red' }}>*</span>}
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={mostrarContrasena ? "text" : "password"}
                                        value={isReadOnly ? '********' : formData.contrasena}
                                        onChange={(e) => handleInputChange('contrasena', e.target.value)}
                                        className="modal-input text-sm p-1"
                                        style={{
                                            width: '100%',
                                            height: '28px',
                                            fontSize: '12px',
                                            padding: '2px 25px 2px 4px',
                                            paddingRight: '25px',
                                            borderColor: formErrors.contrasena ? 'red' : '',
                                            backgroundColor: isReadOnly ? '#f5f5f5' : 'white',
                                            color: isReadOnly ? '#666' : 'black'
                                        }}
                                        placeholder={modalTipo === 'editar' ? 'Opcional (dejar vacío para mantener la actual)' : '8+ chars, 1 mayúscula, 1 especial'}
                                        maxLength={20}
                                        readOnly={isReadOnly}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setMostrarContrasena(!mostrarContrasena)}
                                        style={{
                                            position: 'absolute',
                                            right: '5px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: isReadOnly ? 'default' : 'pointer',
                                            fontSize: '12px',
                                            color: isReadOnly ? '#ccc' : '#666',
                                            padding: '0',
                                            width: '16px',
                                            height: '16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        title={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                        disabled={isReadOnly}
                                    >
                                        {mostrarContrasena ? '👁️' : '👁️‍🗨️'}
                                    </button>
                                </div>
                                {formErrors.contrasena && !isReadOnly && (
                                    <small style={{ color: 'red', fontSize: '10px' }}>{formErrors.contrasena}</small>
                                )}
                            </div>

                            <div className="modal-field">
                                <label className="text-sm" style={{ fontSize: '12px', marginBottom: '2px', display: 'block' }}>
                                    Fecha Nacimiento:
                                </label>
                                {isReadOnly ? (
                                    <input
                                        type="text"
                                        value={formatearFecha(formData.fechaNacimiento)}
                                        className="modal-input text-sm p-1"
                                        style={{
                                            width: '100%', 
                                            height: '28px', 
                                            fontSize: '12px', 
                                            padding: '2px 4px',
                                            backgroundColor: '#f5f5f5',
                                            color: '#666'
                                        }}
                                        readOnly
                                    />
                                ) : (
                                    <input
                                        type="date"
                                        value={formData.fechaNacimiento}
                                        onChange={(e) => handleInputChange('fechaNacimiento', e.target.value)}
                                        className="modal-input text-sm p-1"
                                        style={{
                                            width: '100%', 
                                            height: '28px', 
                                            fontSize: '12px', 
                                            padding: '2px 4px',
                                            borderColor: formErrors.fechaNacimiento ? 'red' : ''
                                        }}
                                    />
                                )}
                                {formErrors.fechaNacimiento && !isReadOnly && (
                                    <small style={{ color: 'red', fontSize: '10px' }}>{formErrors.fechaNacimiento}</small>
                                )}
                            </div>

                            {/* Confirmar Contraseña field - ONLY for 'agregar' mode */}
                            {modalTipo === 'agregar' && (
                                <div className="modal-field">
                                    <label className="text-sm" style={{ fontSize: '12px', marginBottom: '2px', display: 'block' }}>
                                        Confirmar Contraseña: <span style={{ color: 'red' }}>*</span>
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={mostrarConfirmarContrasena ? "text" : "password"}
                                            value={formData.confirmarContrasena}
                                            onChange={(e) => handleInputChange('confirmarContrasena', e.target.value)}
                                            className="modal-input text-sm p-1"
                                            style={{
                                                width: '100%',
                                                height: '28px',
                                                fontSize: '12px',
                                                padding: '2px 25px 2px 4px',
                                                borderColor: formErrors.confirmarContrasena ? 'red' : ''
                                            }}
                                            placeholder="Confirme la contraseña"
                                            maxLength={20}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setMostrarConfirmarContrasena(!mostrarConfirmarContrasena)}
                                            style={{
                                                position: 'absolute',
                                                right: '5px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                color: '#666',
                                                padding: '0',
                                                width: '16px',
                                                height: '16px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            title={mostrarConfirmarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                        >
                                            {mostrarConfirmarContrasena ? '👁️' : '👁️‍🗨️'}
                                        </button>
                                    </div>
                                    {formErrors.confirmarContrasena && (
                                        <small style={{ color: 'red', fontSize: '10px' }}>{formErrors.confirmarContrasena}</small>
                                    )}
                                </div>
                            )}

                            <div className="modal-field">
                                <label className="text-sm" style={{ fontSize: '12px', marginBottom: '2px', display: 'block' }}>
                                    Dirección: <span style={{ color: 'red' }}>*</span>
                                </label>
                                <GoogleAddressAutocomplete
                                    value={formData.direccion}
                                    onChange={(value) => handleInputChange('direccion', value)}
                                    placeholder="Ej: Cra 51a #71-25, Calle 45 #23-12"
                                    className="modal-input text-sm p-1"
                                    style={{
                                        width: '100%', 
                                        height: '28px', 
                                        fontSize: '12px', 
                                        padding: '2px 4px',
                                        borderColor: formErrors.direccion ? 'red' : '',
                                        backgroundColor: isReadOnly ? '#f5f5f5' : 'white',
                                        color: isReadOnly ? '#666' : 'black'
                                    }}
                                    disabled={isReadOnly}
                                    onPlaceSelect={(place) => {
                                        console.log('Place selected:', place); 
                                        
                                        setFormData(prev => ({ 
                                            ...prev, 
                                            direccion: place.direccion || prev.direccion,
                                            barrio: place.barrio || prev.barrio,
                                            ciudad: place.ciudad || prev.ciudad
                                        }));

                                        // Limpiar error de dirección si se selecciona una válida
                                        if (place.direccion && validarDireccionReal(place.direccion)) {
                                            setFormErrors(prev => ({ ...prev, direccion: '' }));
                                        }
                                    }}
                                />
                                {formErrors.direccion && !isReadOnly && (
                                    <small style={{ color: 'red', fontSize: '10px' }}>{formErrors.direccion}</small>
                                )}
                            </div>

                            <div className="modal-field">
                                <label className="text-sm" style={{ fontSize: '12px', marginBottom: '2px', display: 'block' }}>Barrio:</label>
                                <input
                                    type="text"
                                    value={formData.barrio}
                                    onChange={(e) => handleInputChange('barrio', e.target.value)}
                                    className="modal-input text-sm p-1"
                                    style={{ 
                                        width: '100%', 
                                        height: '28px', 
                                        fontSize: '12px', 
                                        padding: '2px 4px',
                                        backgroundColor: isReadOnly ? '#f5f5f5' : 'white',
                                        color: isReadOnly ? '#666' : 'black'
                                    }}
                                    maxLength={30}
                                    readOnly={isReadOnly}
                                />
                            </div>

                            <div className="modal-field">
                                <label className="text-sm" style={{ fontSize: '12px', marginBottom: '2px', display: 'block' }}>Ciudad:</label>
                                <input
                                    type="text"
                                    value={formData.ciudad}
                                    onChange={(e) => handleInputChange('ciudad', e.target.value)}
                                    className="modal-input text-sm p-1"
                                    style={{ 
                                        width: '100%', 
                                        height: '28px', 
                                        fontSize: '12px', 
                                        padding: '2px 4px',
                                        backgroundColor: isReadOnly ? '#f5f5f5' : 'white',
                                        color: isReadOnly ? '#666' : 'black'
                                    }}
                                    maxLength={30}
                                    readOnly={isReadOnly}
                                />
                            </div>

                            {(modalTipo === 'editar') && ( 
                                <div className="modal-field">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.2rem' }}>
                                        <label className="text-sm" style={{ fontSize: '12px' }}>Estado:</label>
                                        <InputSwitch
                                            checked={formData.estado}
                                            onChange={(e) => handleInputChange('estado', e.value)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="modal-footer mt-2 flex justify-end gap-2">
                        <button className="modal-btn cancel-btn text-sm px-3 py-1" onClick={onClose}>Cancelar</button>
                        {modalTipo !== 'visualizar' && (
                        <button className="modal-btn save-btn text-sm px-3 py-1" onClick={handleSave}>Guardar</button>)}      
                    </div>
                </div>
            </div>
        )
    );
}