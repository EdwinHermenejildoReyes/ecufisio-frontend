import api from '@/services/api'

export const pacientesRepository = {
  listar: (params) =>
    api.get('/pacientes/', { params }).then((r) => r.data),

  obtener: (id) =>
    api.get(`/pacientes/${id}/`).then((r) => r.data),

  crear: (data) =>
    api.post('/pacientes/', data).then((r) => r.data),

  actualizar: (id, data) =>
    api.patch(`/pacientes/${id}/`, data).then((r) => r.data),

  historial: (id) =>
    api.get(`/pacientes/${id}/historial/`).then((r) => r.data),
}
