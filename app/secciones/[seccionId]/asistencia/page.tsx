// app/secciones/[seccionId]/asistencia/page.js
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function AsistenciaPage() {
  const params = useParams();
  const router = useRouter();
  const seccionId = params.seccionId;

  const [seccion, setSeccion] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [asistencias, setAsistencias] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchAsistencias = useCallback(async (currentFecha, currentEstudiantes) => {
    if (!currentFecha || currentEstudiantes.length === 0) {
      setAsistencias({});
      return;
    }
    const { data } = await supabase.from('asistencias').select('id_estudiante, estado').eq('fecha', currentFecha).in('id_estudiante', currentEstudiantes.map(e => e.id));
    const asistenciasMap = (data || []).reduce((acc, item) => {
      acc[item.id_estudiante] = item.estado;
      return acc;
    }, {});
    setAsistencias(asistenciasMap);
  }, []);

  useEffect(() => {
    if (!seccionId) return;

    const fetchInitialData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/'); return; }
        const { data: seccionData } = await supabase.from('secciones').select('*').eq('id', seccionId).single();
        if (seccionData) {
          setSeccion(seccionData);
          const { data: estudiantesData } = await supabase.from('estudiantes').select('*').eq('id_seccion', seccionId).order('apellido');
          const studentList = estudiantesData || [];
          setEstudiantes(studentList);
          await fetchAsistencias(fecha, studentList);
        }
      } catch (error) {
        console.error("Error en la carga inicial:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [seccionId, router, fecha, fetchAsistencias]);

  useEffect(() => {
    if (!loading) {
      fetchAsistencias(fecha, estudiantes);
    }
  }, [fecha, estudiantes, loading, fetchAsistencias]);

  const handleSetAsistencia = async (estudianteId, estado) => {
    setAsistencias(prev => ({ ...prev, [estudianteId]: estado }));
    await supabase.from('asistencias').upsert({
      id_estudiante: estudianteId,
      fecha: fecha,
      estado: estado,
    }, { onConflict: 'id_estudiante, fecha' });
  };
  
  if (loading) return <div>Cargando...</div>;
  if (!seccion) return <div><h2>Sección no encontrada</h2><Link href="/dashboard">← Volver</Link></div>;

  return (
    <div className="container">
      <nav style={{ marginBottom: '1rem' }}><Link href={`/secciones/${seccionId}`}>← Volver a la Gestión de la Sección</Link></nav>
      <header>
        <h1>Control de Asistencia: {seccion.nombre_materia}</h1>
        <div style={{ margin: '1rem 0' }}>
          <label htmlFor="fecha-asistencia" style={{ marginRight: '10px', fontWeight: 'bold' }}>Fecha:</label>
          <input type="date" id="fecha-asistencia" value={fecha} onChange={(e) => setFecha(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}/>
        </div>
      </header>
      <hr />
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {estudiantes.map(estudiante => {
          const estadoActual = asistencias[estudiante.id];
          const buttonStyle = { border:'none', padding: '8px 12px', borderRadius: '4px', cursor:'pointer', width: '110px', transition: 'opacity 0.2s' };
          return (
            <li key={estudiante.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #eee' }}>
              <span>{estudiante.apellido}, {estudiante.nombre}</span>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => handleSetAsistencia(estudiante.id, 'Presente')} style={{ ...buttonStyle, backgroundColor: '#2ecc71', color: 'white', opacity: estadoActual === 'Presente' ? 1 : 0.4 }}>Presente</button>
                <button onClick={() => handleSetAsistencia(estudiante.id, 'Ausente')} style={{ ...buttonStyle, backgroundColor: '#e74c3c', color: 'white', opacity: estadoActual === 'Ausente' ? 1 : 0.4 }}>Ausente</button>
                <button onClick={() => handleSetAsistencia(estudiante.id, 'Justificado')} style={{ ...buttonStyle, backgroundColor: '#f39c12', color: 'white', opacity: estadoActual === 'Justificado' ? 1 : 0.4 }}>Justificado</button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}