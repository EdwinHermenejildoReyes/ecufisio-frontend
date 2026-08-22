import api from '@/services/api'

export const cobrosRepository = {
  // Pagos
  listarPagos: (params) =>
    api.get('/cobros/pagos/', { params }).then((r) => r.data),

  obtenerPago: (id) =>
    api.get(`/cobros/pagos/${id}/`).then((r) => r.data),

  crearPago: (data) =>
    api.post('/cobros/pagos/', data).then((r) => r.data),

  marcarPagado: (id) =>
    api.post(`/cobros/pagos/${id}/marcar_pagado/`).then((r) => r.data),

  reembolsar: (id) =>
    api.post(`/cobros/pagos/${id}/reembolsar/`).then((r) => r.data),

  resumen: () =>
    api.get('/cobros/pagos/resumen/').then((r) => r.data),

  // Paquetes
  listarPaquetes: (params) =>
    api.get('/cobros/paquetes/', { params }).then((r) => r.data),

  crearPaquete: (data) =>
    api.post('/cobros/paquetes/', data).then((r) => r.data),

  actualizarPaquete: (id, data) =>
    api.patch(`/cobros/paquetes/${id}/`, data).then((r) => r.data),

  cancelarPaquete: (id) =>
    api.post(`/cobros/paquetes/${id}/cancelar/`).then((r) => r.data),
}
