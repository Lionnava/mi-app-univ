// components/EvaluacionesLista.js
'use client';

// Ahora recibe las funciones onEditar y onEliminar
export default function EvaluacionesLista({ evaluaciones, onEditarEvaluacion, onEliminarEvaluacion }) {

  const totalPonderacion = evaluaciones.reduce((sum, item) => sum + item.ponderacion, 0);

  const handleEliminarClick = (evaluacion) => {
    if (window.confirm(`¿Seguro que quieres eliminar la evaluación "${evaluacion.nombre_evaluacion}"?`)) {
      onEliminarEvaluacion(evaluacion.id);
    }
  };
  
  // ... (Estilos y lógica de mensajes dinámicos sin cambios) ...
  let statusStyle = { color: 'black', fontWeight: 'normal', marginLeft: '10px' };
  let statusMessage = '';
  if (evaluaciones.length > 0) {
      if (totalPonderacion < 100) { statusStyle.color = '#e67e22'; statusMessage = `(Falta ${100 - totalPonderacion}%)`; } 
      else if (totalPonderacion > 100) { statusStyle.color = '#e74c3c'; statusMessage = `(Excede por ${totalPonderacion - 100}%)`; } 
      else { statusStyle.color = '#2ecc71'; statusMessage = '(¡Correcto!)'; }
  }

  return (
    <section>
      <h4>Plan de Evaluación</h4>
      {evaluaciones.length === 0 ? (
        <p>Aún no has creado ninguna evaluación.</p>
      ) : (
        <>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {evaluaciones.map((evaluacion) => (
              <li key={evaluacion.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #eee' }}>
                <div>
                  <span>{evaluacion.nombre_evaluacion}</span>
                  <strong style={{ marginLeft: '10px' }}>({evaluacion.ponderacion}%)</strong>
                </div>
                <div>
                  <button onClick={() => onEditarEvaluacion(evaluacion)} style={{ backgroundColor: '#0070f3', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                    Editar
                  </button>
                  <button onClick={() => handleEliminarClick(evaluacion)} style={{ marginLeft: '5px', backgroundColor: '#f44336', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div style={{ textAlign: 'right', fontWeight: 'bold', marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid #333' }}>
            Total Ponderado: {totalPonderacion}%
            <span style={statusStyle}>{statusMessage}</span>
          </div>
        </>
      )}
    </section>
  );
}