// app/dashboard/page.tsx
'use client'; 

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

// Importamos los iconos
import { Edit, Trash2 } from 'lucide-react'; 

// Importamos los componentes de shadcn/ui
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Importamos nuestro componente de formulario
import SeccionForm from '@/components/SeccionForm'; 

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [secciones, setSecciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [editingSection, setEditingSection] = useState<any>(null);

  // --- FUNCIONES DE LÓGICA DEL COMPONENTE ---

  const cargarSecciones = async () => {
    const { data, error } = await supabase.from('secciones').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error cargando secciones:', error);
      setSecciones([]);
    } else {
      setSecciones(data || []);
    }
  };
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleEliminarSeccion = async (seccionId: string, seccionNombre: string) => {
    if (window.confirm(`¿Seguro que quieres eliminar la sección "${seccionNombre}"? Se borrarán TODOS sus estudiantes, evaluaciones y notas.`)) {
        const { error } = await supabase.from('secciones').delete().eq('id', seccionId);
        if (error) {
            alert(`Error al eliminar: ${error.message}`);
        } else {
            cargarSecciones();
        }
    }
  };

  const handleSeccionFormSubmit = () => {
    cargarSecciones();
    setEditingSection(null);
  };
  
  // --- EFECTO DE CARGA INICIAL ---

  useEffect(() => {
    const checkUserAndLoadData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUser(user);
            await cargarSecciones(); 
        } else {
            router.push('/');
        }
        setLoading(false);
    };
    checkUserAndLoadData();
  }, [router]);

  if (loading) return <div className="flex justify-center items-center h-screen">Cargando datos del profesor...</div>;

  return (
    <div className="p-4 md:p-8"> 
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Panel del Profesor</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{user?.email}</span>
          <Button variant="outline" onClick={handleSignOut}>Cerrar Sesión</Button>
        </div>
      </header>
      
      <main>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Crear Nueva Sección</CardTitle>
          </CardHeader>
          <CardContent>
            <SeccionForm onFormSubmit={handleSeccionFormSubmit} />
          </CardContent>
        </Card>
        
        <h2 className="text-2xl font-semibold mb-4">Mis Secciones Creadas</h2>
        {secciones.length > 0 ? (
          <div className="grid gap-4">
            {secciones.map((seccion) => (
              <Card key={seccion.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <Link href={`/secciones/${seccion.id}`}>
                      <CardTitle className="cursor-pointer hover:underline text-blue-600">{seccion.nombre_materia}</CardTitle>
                    </Link>
                    <CardDescription>Código: {seccion.codigo_seccion} | Trayecto {seccion.trayecto}, Trimestre {seccion.trimestre}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="icon" onClick={() => setEditingSection(seccion)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleEliminarSeccion(seccion.id, seccion.nombre_materia)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center p-8"><p>Aún no has creado ninguna sección. ¡Usa el formulario para empezar!</p></Card>
        )}
      </main>

      <Dialog open={!!editingSection} onOpenChange={(isOpen) => !isOpen && setEditingSection(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Sección</DialogTitle></DialogHeader>
          <SeccionForm initialData={editingSection} onFormSubmit={handleSeccionFormSubmit} />
        </DialogContent>
      </Dialog>
    </div>
  );
}