// types/index.ts
import { User } from '@supabase/supabase-js';

export type Estudiante = {
  id: string;
  nombre: string;
  apellido: string;
  cedula: string;
  id_seccion: string;
};

export type Evaluacion = {
  id: string;
  nombre_evaluacion: string;
  ponderacion: number;
  id_seccion: string;
};

export type Seccion = {
    id: string;
    nombre_materia: string;
    codigo_seccion: string;
    trayecto: number;
    trimestre: number;
    user_id: string;
};

// Exportamos también los tipos de Supabase por conveniencia
export type AppUser = User;