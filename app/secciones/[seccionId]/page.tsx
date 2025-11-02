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
import HorarioForm from '@/components/HorarioForm'; // Importamos el formulario del horario

// Definimos un tipo para los bloques de horario
type BloqueHorario = {
    id: string;
    dia_semana: number;
    hora_inicio: string;
    hora_fin: string;
    aula: string;
};

export default function SeccionDetallePage() {
  const params = useParams();
  const router = useRouter();
  const seccionId = params.seccionId as string;

  const [seccion, setSeccion] = useState<Seccion | null>(null);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [horario, setHorario] = useState<BloqueHorario[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState<Estudiante | null>(null);
  const [editingEvaluation, setEditingEvaluation] = useState<Evaluacion | null>(null);

  // --- Funciones de Carga de Datos ---
  const fetchEstudiantes = useCallback(async () => { /* ... */ }, [seccionId]);
  const fetchEvaluaciones = useCallback(async () => { /* ... */ }, [seccionId]);
  const fetchHorario = useCallback(async () => {
    if (!seccionId) return;
    const { data, error } = await supabase.from('horario').select('*').eq('id_seccion', seccionId).order('dia_semana').order('hora_inicio');
    if (error) console.error("Error cargando horario:", error);
    else setHorario(data || []);
  }, [seccionId]);

  // --- Handlers ---
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
          await Promise.all([ fetchEstudiantes(), fetchEvaluaciones(), fetchHorario() ]);
        }
      } catch (error) { console.error("Error al cargar datos:", error); } 
      finally { setLoading(false); }
    };
    checkUserAndFetchAllData();
  }, [seccionId, router, fetchEstudiantes, fetchEvaluaciones, fetchHorario]);

  const totalPonderacionActual = evaluaciones.reduce((sum, item) => sum + item.ponderacion, 0);
  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  if (loading) return <div>Cargando...</div>;
  if (!seccion) return <div><h2>Sección no encontrada</h2><Link href="/dashboard">← Volver</Link></div>;

  return (
    <div>
      <nav className="mb-4">
        <Button variant="outline" asChild><Link href="/dashboard">← Volver al Panel</Link></Button>
      </nav>
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de: {seccion.nombre_materia}</h1>
        <Button asChild><Link href={`/secciones/${seccionId}/asistencia`}>Pasar Asistencia</Link></Button>
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

      {/* --- SECCIÓN DEL HORARIO (COMPLETA) --- */}
      <div className="mt-8">
        <Card>
            <CardHeader><CardTitle>Horario de la Sección</CardTitle></CardHeader>
            <CardContent className="space-y-6">
                <HorarioForm seccionId={seccion.id} onBloqueCreado={fetchHorario} />
                <div>
                    <h4 className="font-semibold mb-4">Bloques Asignados</h4>
                    {horario.length > 0 ? (
                        <div className="border rounded-lg">
                            {horario.map(bloque => (
                                <div key={bloque.id} className="flex justify-between items-center p-3 border-b last:border-b-0">
                                    <div className="flex flex-col">
                                        <span c