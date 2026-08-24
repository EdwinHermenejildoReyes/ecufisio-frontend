import api from '@/services/api'

export const ejerciciosRepository = {
  // Biblioteca
  listar: (params) =>
    api.get('/ejercicios/', { params }).then((r) => r.data),
  obtener: (id) =>
    api.get(`/ejercicios/${id}/`).then((r) => r.data),
  crear: (data) =>
    api.post('/ejercicios/', data).then((r) => r.data),
  actualizar: (id, data) =>
    api.patch(`/ejercicios/${id}/`, data).then((r) => r.data),
  eliminar: (id) =>
    api.delete(`/ejercicios/${id}/`),

  // Grupos musculares
  listarGrupos: () =>
    api.get('/ejercicios/grupos-musculares/').then((r) => r.data),
  crearGrupo: (data) =>
    api.post('/ejercicios/grupos-musculares/', data).then((r) => r.data),
  actualizarGrupo: (id, data) =>
    api.patch(`/ejercicios/grupos-musculares/${id}/`, data).then((r) => r.data),
  eliminarGrupo: (id) =>
    api.delete(`/ejercicios/grupos-musculares/${id}/`),

  // Rutina de sesión
  listarRutina: (sesionId) =>
    api.get('/ejercicios/rutina/', { params: { sesion: sesionId } }).then((r) => r.data),
  agregarARutina: (data) =>
    api.post('/ejercicios/rutina/', data).then((r) => r.data),
  actualizarRutina: (id, data) =>
    api.patch(`/ejercicios/rutina/${id}/`, data).then((r) => r.data),
  eliminarDeRutina: (id) =>
    api.delete(`/ejercicios/rutina/${id}/`),
  reordenarRutina: (items) =>
    api.post('/ejercicios/rutina/reordenar/', items).then((r) => r.data),

  // Adherencia
  listarAdherencia: (rutinaEjercicioId) =>
    api.get('/ejercicios/adherencia/', { params: { rutina_ejercicio: rutinaEjercicioId } }).then((r) => r.data),
  registrarAdherencia: (data) =>
    api.post('/ejercicios/adherencia/', data).then((r) => r.data),
  actualizarAdherencia: (id, data) =>
    api.patch(`/ejercicios/adherencia/${id}/`, data).then((r) => r.data),
}
