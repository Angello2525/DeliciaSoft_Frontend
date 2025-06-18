import React from "react";

const mockData = [
  {
    id: 1,
    nombre: "Arroz con Leche Clásico",
    precio: 5000,
    imagen: "/imagenes/Cartas/arrozconleche1.jpeg",
    descripcion: "Suave, cremoso, con canela espolvoreada por encima.",
  },
  {
    id: 2,
    nombre: "Arroz con Leche con Coco",
    precio: 6000,
    imagen: "/imagenes/Cartas/arrozcoco.jpeg",
    descripcion: "Mezcla tropical con coco rallado, sabor inolvidable.",
  },
  {
    id: 3,
    nombre: "Arroz con Leche Frutal",
    precio: 6500,
    imagen: "/imagenes/Cartas/arrozfrutas.jpeg",
    descripcion: "Incluye trozos de durazno, fresa y mango para un sabor refrescante.",
  },
];

const DetalleArroz = () => {
  return (
    <div className="producto-detalle-container">
      <h2 className="detalle-titulo">ARROZ CON LECHE</h2>

      <div className="productos-detalle">
        {mockData.map((producto) => (
          <div className="producto-card" key={producto.id}>
            <img src={producto.imagen} alt={producto.nombre} className="producto-img" />
            <div className="producto-info">
              <h3>{producto.nombre}</h3>
              <p className="precio-extra">${producto.precio}</p>
              {producto.descripcion && (
                <p className="descripcion">{producto.descripcion}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="nota-clientes">
        <p>🎉 ¡Gracias por preferirnos! Todos nuestros productos son preparados con ingredientes frescos y mucho amor. 💖</p>
        <p>Además, puedes pedirlo caliente o frío, con toppings de frutas. 🍓🥭</p>
        <p>"Y recuerda, no dejes para mañana lo que te puedes comer hoy" 💖</p>
      </div>
    </div>
  );
};

export default DetalleArroz;
