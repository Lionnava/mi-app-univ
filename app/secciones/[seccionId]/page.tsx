// app/secciones/[seccionId]/page.js
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

// Componentes
import Modal from '@/components/Modal';
import EstudianteForm from '@/components/EstudianteForm';
import EstudiantesLista from '@/components/EstudiantesLista';
import EvaluacionForm from '@/components/EvaluacionForm';
import EvaluacionesLista from '@/components/EvaluacionesLista';
import ConsolidadoNotas from '@/components/ConsolidadoNotas';

export default function SeccionDetallePage() {
  const params = useParams();
  const router = useRouter();
  // Leemos el parámetro `seccionId` que coincide con el nombre de la carpeta
  const seccionId = params.seccionId; 

  const [seccion, setSeccion] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editingEvaluation, setEditingEvaluation] = useState(null);

  // --- FUNCIONES MEMORIZADAS CON useCallback ---
  const fetchEstudiantes = useCallback(async () => {
    if (!seccionId) return;
    const { data, error } = await supabase.from('estudiantes').select('*').eq('id_seccion', seccionId).order('apellido', { ascending: true });
    if (error) console.error('Error cargando estudiantes:', error);
    else setEstudiantes(data || []);
  }, [seccionId]);
  
  const fetchEvaluaciones = useCallback(async () => {
    if (!seccionId) return;
    const { data, error } = await supabase.from('evaluaciones').select('*').eq('id_seccion', seccionId).order('created_at', { ascending: true });
    if (error) console.error('Error cargando evaluaciones:', error);
    else setEvaluaciones(data || []);
  }, [seccionId]);

  // --- Handlers ---
  const handleEliminarEstudiante = async (estudianteId) => {
    const { error } = await supabase.from('estudiantes').delete().eq('id', estudianteId);
    if (error) alert(`Error al eliminar: ${error.message}`);
    else fetchEstudiantes();
  };
  const handleEstudianteFormSubmit = () => { fetchEstudiantes(); setEditingStudent(null); };
  const handleEliminarEvaluacion = async (evaluacionId) => {
    const { error } = await supabase.from('evaluaciones').delete().eq('id', evaluacionId);
    if (error) alert(`Error al eliminar: ${error.message}`);
    else fetchEvaluaciones();
  };
  const handleEvaluacionFormSubmit = () => { fetchEvaluaciones(); setEditingEvaluation(null); };

  // --- EFECTO PRINCIPAL DE CARGA ---
  useEffect(() => {
    if (!seccionId) {
        // Si `seccionId` no está disponible en el primer render, no hacemos nada todavía
        return;
    }
    const checkUserAndFetchAllData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/'); return; }
        const { data: seccionData } = await supabase.from('secciones').select('*').eq('id', seccionId).single();
        if (seccionData) {
          setSeccion(seccionData);
          await Promise.all([ fetchEstudiantes(), fetchEvaluaciones() ]);
        }
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      } finally {
        setLoading(false);
      }
    };
    checkUserAndFetchAllData();
  }, [seccionId, router, fetchEstudiantes, fetchEvaluaciones]);

  const totalPonderacionActual = evaluaciones.reduce((sum, item) => sum + item.ponderacion, 0);

  if (loading) return <div>Cargando...</div>;
  if (!seccion) return <div><h2>Sección no encontrada</h2><Link href="/dashboard">← Volver</Link></div>;

  return (
    <div className="container">
      <nav style={{ marginBottom: '1rem' }}><Link href="/dashboard">← Volver al Panel</Link></nav>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Gestión de: {seccion.nombre_materia}</h1>
        <Link href={`/secciones/${seccionId}/asistencia`}>
          <button style={{ backgroundColor: '#3498db', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' }}>
            Pasar Asistencia
          </button>
        </Link>
      </header>
      <hr style={{ margin: '2rem 0' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        <section>
          <h2>Estudiantes</h2>
          <EstudianteForm seccionId={seccion.id} onFormSubmit={handleEstudianteFormSubmit} />
          <hr style={{ margin: '1.5rem 0' }} />
          <EstudiantesLista 
            estudiantes={estudiantes} 
            onEliminarEstudiante={handleEliminarEstudiante}
            onEditarEstudiante={(student) => setEditingStudent(student)}
          />
        </section>
        <section>
          <h2>Plan de Evaluación</h2>
          <EvaluacionForm 
            seccionId={seccion.id} 
            onFormSubmit={handleEvaluacionFormSubmit}
            totalPonderacionActual={totalPonderacionActual} 
          />
          <hr style={{ margin: '1.5rem 0' }} />
          <EvaluacionesLista 
            evaluaciones={evaluaciones}
            onEditarEvaluacion={(evaluation) => setEditingEvaluation(evaluation)}
            onEliminarEvaluacion={handleEliminarEvaluacion}
          />
        </section>
      </div>
      <hr style={{ margin: '2rem 0' }} />
      <ConsolidadoNotas 
        estudiantes={estudiantes} 
        evaluaciones={evaluaciones}
        nombreSeccion={seccion.nombre_materia}
        totalPonderado={totalPonderacionActual}
      />
      <Modal isOpen={!!editingStudent} onClose={() => setEditingStudent(null)} title="Editar Estudiante">
        <EstudianteForm 
          initialData={editingStudent} 
          onFormSubmit={handleEstudianteFormSubmit} 
        />
      </Modal>
      <Modal isOpen={!!editingEvaluation} onClose={() => setEditingEvaluation(null)} title="Editar Evaluación">
        <EvaluacionForm 
          initialData={editingEvaluation} 
          onFormSubmit={handleEvaluacionFormSubmit}
          totalPonderacionActual={totalPonderacionActual}
        />
      </Modal>
    </div>
  );
}