// app/secciones/[seccionId]/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

// Importamos nuestros tipos centralizados
import type { Seccion, Estudiante, Evaluacion } from '@/types';

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
  const seccionId = params.seccionId as string;

  // Estados fuertemente tipados
  const [seccion, setSeccion] = useState<Seccion | null>(null);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState<Estudiante | null>(null);
  const [editingEvaluation, setEditingEvaluation] = useState<Evaluacion | null>(null);

  const fetchEstudiantes = useCallback(async () => { /* ... */ }, [seccionId]);
  const fetchEvaluaciones = useCallback(async () => { /* ... */ }, [seccionId]);
  
  // Handlers
  const handleEliminarEstudiante = async (estudianteId: string) => { /* ... */ };
  const handleEstudianteFormSubmit = () => { fetchEstudiantes(); setEditingStudent(null); };
  const handleEliminarEvaluacion = async (evaluacionId: string) => { /* ... */ };
  const handleEvaluacionFormSubmit = () => { fetchEvaluaciones(); setEditingEvaluation(null); };

  useEffect(() => {
    if (!seccionId) return;
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
        {/* ... (el resto del JSX no cambia, pero ahora TypeScript lo valida correctamente) ... */}

      <Modal isOpen={!!editingStudent} onClose={() => setEditingStudent(null)} title="Editar Estudiante">
        <EstudianteForm 
          initialData={editingStudent} // AHORA LOS TIPOS COINCIDEN
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