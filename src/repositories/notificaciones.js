import api from '@/services/api'

export const notificacionesRepository = {
  listar: (params) =>
    api.get('/notificaciones/', { params }).then((r) => r.data),

  resumen: () =>
    api.get('/notificaciones/resumen/').then((r) => r.data),

  recientes: () =>
    api.get('/notificaciones/recientes/').then((r) => r.data),

  reintentar: (id) =>
    api.post(`/notificaciones/${id}/reintentar/`).then((r) => r.data),
}
