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

  desactivar: (id) =>
    api.post(`/pacientes/${id}/desactivar/`).then((r) => r.data),

  historialCitas: (id, params) =>
    api.get(`/pacientes/${id}/citas/`, { params }).then((r) => r.data),

  paquetes: (id) =>
    api.get(`/pacientes/${id}/paquetes/`).then((r) => r.data),
}
