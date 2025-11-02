// components/ConsolidadoNotas.js
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Papa from 'papaparse'; // 1. IMPORTAMOS LA LIBRERÍA

export default function ConsolidadoNotas({ estudiantes, evaluaciones, nombreSeccion }) { // Añadimos nombreSeccion
  const [notas, setNotas] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ... (El useEffect para fetchNotas sigue exactamente igual)
    const fetchNotas = async () => {
      if (estudiantes.length === 0) { setLoading(false); return; }
      const estudianteIds = estudiantes.map(e => e.id);
      const { data, error } = await supabase.from('notas').select('*').in('id_estudiante', estudianteIds);

      if (error) { console.error("Error al cargar las notas:", error); } 
      else {
        const notasMap = data.reduce((acc, nota) => {
          acc[`${nota.id_estudiante}-${nota.id_evaluacion}`] = nota.calificacion;
          return acc;
        }, {});
        setNotas(notasMap);
      }
      setLoading(false);
    };
    fetchNotas();
  }, [estudiantes]);

  const handleSaveNota = async (estudianteId, evaluacionId, calificacion) => { /* ... (sin cambios) ... */ };
  const calcularNotaFinal = (estudianteId) => { /* ... (sin cambios) ... */ };
  
  // 2. LÓGICA PARA EXPORTAR A CSV
  const handleExportCSV = () => {
    // a. Definimos las cabeceras de nuestro archivo CSV
    const headers = [
      'Cedula',
      'Apellido',
      'Nombre',
      ...evaluaciones.map(ev => `${ev.nombre_evaluacion} (${ev.ponderacion}%)`),
      'Nota Final'
    ];
    
    // b. Creamos una fila por cada estudiante
    const data = estudiantes.map(estudiante => {
      const row = {
        'Cedula': estudiante.cedula,
        'Apellido': estudiante.apellido,
        'Nombre': estudiante.nombre,
      };
      
      evaluaciones.forEach(ev => {
        const nota = notas[`${estudiante.id}-${ev.id}`] || 0;
        row[`${ev.nombre_evaluacion} (${ev.ponderacion}%)`] = nota;
      });
      
      row['Nota Final'] = calcularNotaFinal(estudiante.id);
      
      return row;
    });

    // c. Usamos Papaparse para convertir nuestro objeto de datos a un string CSV
    const csv = Papa.unparse({
      fields: headers,
      data: data,
    });
    
    // d. Creamos un archivo virtual y simulamos un clic para descargarlo
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      const fecha = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
      link.setAttribute('href', url);
      link.setAttribute('download', `notas_${nombreSeccion.replace(/\s+/g, '_')}_${fecha}.csv`); // Ej: notas_Programacion_II_2025-11-01.csv
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };


  if (estudiantes.length === 0 || evaluaciones.length === 0) { /* ... (sin cambios) ... */ }
  if (loading) return <p>Cargando notas...</p>;

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Consolidado de Notas</h2>
        {/* 3. AÑADIMOS EL BOTÓN DE EXPORTACIÓN */}
        <button 
          onClick={handleExportCSV}
          style={{ backgroundColor: '#107c10', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer' }}
        >
          Exportar a Excel (CSV)
        </button>
      </div>
      {/* ... (La tabla de notas sigue exactamente igual) ... */}
      <table style={ { width: '100%', borderCollapse: 'collapse', marginTop: '1rem', fontSize: '0.9rem' } }>
        { /* ... el contenido de la tabla ... */ }
      </table>
    </section>
  );
}

// ... (Pega aquí las funciones handleSaveNota y calcularNotaFinal que ya tenías)
const handleSaveNota = async (estudianteId, evaluacionId, calificacion) => {
    const notaNum = parseFloat(calificacion);
    if (isNaN(notaNum) || notaNum < 0 || notaNum > 20) {
      return;
    }
    const { error } = await supabase.from('notas').upsert({
      id_estudiante: estudianteId,
      id_evaluacion: evaluacionId,
      calificacion: notaNum,
    }, { onConflict: 'id_estudiante, id_evaluacion' });
    if (error) console.error("Error al guardar la nota:", error);
    else {
      setNotas(prev => ({ ...prev, [`${estudianteId}-${evaluacionId}`]: notaNum }));
    }
  };

const calcularNotaFinal = (estudianteId) => {
    let notaFinal = 0;
    evaluaciones.forEach(evaluacion => {
      const nota = notas[`${estudianteId}-${evaluacion.id}`] || 0;
      const ponderacion = evaluacion.ponderacion / 100;
      notaFinal += nota * ponderacion;
    });
    return notaFinal.toFixed(2);
  };