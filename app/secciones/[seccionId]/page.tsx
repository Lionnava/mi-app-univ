// app/secciones/[seccionId]/page.tsx
// ... (imports)
import HorarioForm from '@/components/HorarioForm'; // Importar el nuevo formulario
// ... (resto de imports)

// ... (dentro de SeccionDetallePage)
// ...
const [horario, setHorario] = useState<any[]>([]); // Nuevo estado

// Nueva función para cargar los bloques de horario de esta sección
const fetchHorario = useCallback(async () => {
    if (!seccionId) return;
    const { data, error } = await supabase
        .from('horario')
        .select('*')
        .eq('id_seccion', seccionId)
        .order('dia_semana')
        .order('hora_inicio');
    if (error) console.error("Error cargando horario:", error);
    else setHorario(data || []);
}, [seccionId]);

// Añadir fetchHorario al useEffect principal
useEffect(() => {
    if (!seccionId) return;
    const checkUserAndFetchAllData = async () => {
        // ... (lógica existente)
        await Promise.all([ fetchEstudiantes(), fetchEvaluaciones(), fetchHorario() ]); // Añadir fetchHorario
        // ...
    };
    checkUserAndFetchAllData();
}, [seccionId, router, fetchEstudiantes, fetchEvaluaciones, fetchHorario]); // Añadir fetchHorario

// ... (resto de la lógica)

// En el JSX, añade una nueva sección para el horario:
return (
    <div>
        {/* ... (todo el JSX existente hasta el final) ... */}

        {/* --- NUEVA SECCIÓN DEL HORARIO --- */}
        <hr className="my-8" />
        <Card>
            <CardHeader><CardTitle>Horario de la Sección</CardTitle></CardHeader>
            <CardContent className="space-y-6">
                <HorarioForm seccionId={seccion.id} onBloqueCreado={fetchHorario} />
                <div>
                    <h4 className="font-semibold mb-2">Bloques Asignados</h4>
                    {horario.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-1">
                            {horario.map(bloque => (
                                <li key={bloque.id}>
                                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][bloque.dia_semana - 1]}: 
                                    {' '}{bloque.hora_inicio} - {bloque.hora_fin} en <strong>{bloque.aula}</strong>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground">No hay bloques de horario asignados a esta sección.</p>
                    )}
                </div>
            </CardContent>
        </Card>

        {/* ... (los Modales) ... */}
    </div>
);