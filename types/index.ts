// types/index.ts
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