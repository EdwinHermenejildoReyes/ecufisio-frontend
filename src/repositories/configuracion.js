import api from '@/services/api'

export const configuracionRepository = {
  // Clínica
  perfil: () =>
    api.get('/clinica/perfil/').then((r) => r.data),
  actualizarPerfil: (data) =>
    api.patch('/clinica/perfil/', data).then((r) => r.data),

  // Servicios
  listarServicios: () =>
    api.get('/clinica/servicios/').then((r) => r.data),
  crearServicio: (data) =>
    api.post('/clinica/servicios/', data).then((r) => r.data),
  actualizarServicio: (id, data) =>
    api.patch(`/clinica/servicios/${id}/`, data).then((r) => r.data),
  eliminarServicio: (id) =>
    api.delete(`/clinica/servicios/${id}/`),

  // Salas
  listarSalas: () =>
    api.get('/clinica/salas/').then((r) => r.data),
  crearSala: (data) =>
    api.post('/clinica/salas/', data).then((r) => r.data),
  actualizarSala: (id, data) =>
    api.patch(`/clinica/salas/${id}/`, data).then((r) => r.data),
  eliminarSala: (id) =>
    api.delete(`/clinica/salas/${id}/`),

  // Equipo
  listarEquipo: () =>
    api.get('/clinica/equipo/').then((r) => r.data),
  crearMiembro: (data) =>
    api.post('/clinica/equipo/', data).then((r) => r.data),
  actualizarMiembro: (id, data) =>
    api.patch(`/clinica/equipo/${id}/`, data).then((r) => r.data),
  desactivarMiembro: (id) =>
    api.post(`/clinica/equipo/${id}/desactivar/`).then((r) => r.data),
  activarMiembro: (id) =>
    api.post(`/clinica/equipo/${id}/activar/`).then((r) => r.data),

  // Disponibilidad (horarios)
  listarDisponibilidad: (fisioId) =>
    api.get('/agenda/disponibilidad/', { params: { fisioterapeuta: fisioId } }).then((r) => r.data),
  crearDisponibilidad: (data) =>
    api.post('/agenda/disponibilidad/', data).then((r) => r.data),
  actualizarDisponibilidad: (id, data) =>
    api.patch(`/agenda/disponibilidad/${id}/`, data).then((r) => r.data),
  eliminarDisponibilidad: (id) =>
    api.delete(`/agenda/disponibilidad/${id}/`),
}
