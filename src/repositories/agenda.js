import api from '@/services/api'

export const agendaRepository = {
  listarCitas: (params) =>
    api.get('/agenda/citas/', { params }).then((r) => r.data),

  obtenerCita: (id) =>
    api.get(`/agenda/citas/${id}/`).then((r) => r.data),

  crearCita: (data) =>
    api.post('/agenda/citas/', data).then((r) => r.data),

  actualizarCita: (id, data) =>
    api.patch(`/agenda/citas/${id}/`, data).then((r) => r.data),

  cancelarCita: (id) =>
    api.post(`/agenda/citas/${id}/cancelar/`).then((r) => r.data),

  disponibilidad: (fisioterapeutaId, fecha) =>
    api.get('/agenda/disponibilidad/', { params: { fisioterapeuta: fisioterapeutaId, fecha } }).then((r) => r.data),
}
