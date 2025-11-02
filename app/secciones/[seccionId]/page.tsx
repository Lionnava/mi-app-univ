// app/secciones/[seccionId]/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

// Tipos
import type { Seccion, Estudiante, Evaluacion } from '@/types';

// Componentes
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

  // --- FUNCIONES DE CARGA Y MANEJO DE DATOS ---
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

  const handleEliminarEstudiante = async (estudianteId: string) => {
    const { error } = await supabase.from('estudiantes').delete().eq('id', estudianteId);
    if (error) alert(`Error al eliminar: ${error.message}`);
    else fetchEstudiantes();
  };
  const handleEstudianteFormSubmit = () => { fetchEstudiantes(); setEditingStudent(null); };
  const handleEliminarEvaluacion = async (evaluacionId: string) => {
    const { error } = await supabase.from('evaluaciones').delete().eq('id', evaluacionId);
    if (error) alert(`Error al eliminar: ${error.message}`);
    else fetchEvaluaciones();
  };
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
    <div>
      <nav className="mb-4">
        <Button variant="outline" asChild>
            <Link href="/dashboard">← Volver al Panel</Link>
        </Button>
      </nav>
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de: {seccion.nombre_materia}</h1>
        <Button asChild>
            <Link href={`/secciones/${seccionId}/asistencia`}>Pasar Asistencia</Link>
        </Button>
      </header>
      
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader><CardTitle>Estudiantes</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <EstudianteForm seccionId={seccion.id} onFormSubmit={handleEstudianteFormSubmit} />
            <EstudiantesLista 
              estudiantes={estudiantes} 
              onEliminarEstudiante={handleEliminarEstudiante}
              onEditarEstudiante={(student: Estudiante) => setEditingStudent(student)}
            />
          </CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle>Plan de Evaluación</CardTitle></CardHeader>
            <CardContent className="space-y-6">
                <EvaluacionForm 
                    seccionId={seccion.id} 
                    onFormSubmit={handleEvaluacionFormSubmit}
                    totalPonderacionActual={totalPonderacionActual} 
                />
                <EvaluacionesLista 
                    evaluaciones={evaluaciones}
                    onEditarEvaluacion={(evaluation: Evaluacion) => setEditingEvaluation(evaluation)}
                    onEliminarEvaluacion={handleEliminarEvaluacion}
                />
            </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <ConsolidadoNotas 
          estudiantes={estudiantes} 
          evaluaciones={evaluaciones}
          nombreSeccion={seccion.nombre_materia}
          totalPonderado={totalPonderacionActual}
        />
      </div>

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