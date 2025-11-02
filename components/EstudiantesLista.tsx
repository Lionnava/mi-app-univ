// components/EstudiantesLista.js
'use client';

// Ahora el componente también recibe `onEditarEstudiante`
export default function EstudiantesLista({ estudiantes, onEliminarEstudiante, onEditarEstudiante }) {
  const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '1rem' };
  const thTdStyle = { border: '1px solid #ddd', padding: '8px', textAlign: 'left' };

  const handleEliminarClick = (estudiante) => {
    if (window.confirm(`¿Seguro que quieres eliminar a ${estudiante.nombre} ${estudiante.apellido}?`)) {
      onEliminarEstudiante(estudiante.id);
    }
  };

  if (estudiantes.length === 0) {
    return <p>Aún no hay estudiantes en esta sección.</p>;
  }

  return (
    <section>
      <h4>Estudiantes Inscritos</h4>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thTdStyle}>Nombre</th>
            <th style={thTdStyle}>Apellido</th>
            <th style={thTdStyle}>Cédula</th>
            <th style={thTdStyle}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {estudiantes.map((estudiante) => (
            <tr key={estudiante.id}>
              <td style={thTdStyle}>{estudiante.nombre}</td>
              <td style={thTdStyle}>{estudiante.apellido}</td>
              <td style={thTdStyle}>{estudiante.cedula}</td>
              <td style={thTdStyle}>
                {/* BOTÓN EDITAR - AHORA FUNCIONAL */}
                <button
                  onClick={() => onEditarEstudiante(estudiante)}
                  style={{ backgroundColor: '#0070f3', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Editar
                </button>
                {/* BOTÓN ELIMINAR */}
                <button
                  onClick={() => handleEliminarClick(estudiante)}
                  style={{ marginLeft: '5px', backgroundColor: '#f44336', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}