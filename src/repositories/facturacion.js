import api from '@/services/api'

export const facturacionRepository = {
  listar: (params) =>
    api.get('/facturacion/', { params }).then((r) => r.data),

  obtener: (id) =>
    api.get(`/facturacion/${id}/`).then((r) => r.data),

  crear: (pagoId) =>
    api.post('/facturacion/', { pago_id: pagoId }).then((r) => r.data),

  enviar: (id) =>
    api.post(`/facturacion/${id}/enviar/`).then((r) => r.data),

  anular: (id) =>
    api.post(`/facturacion/${id}/anular/`).then((r) => r.data),

  resumen: () =>
    api.get('/facturacion/resumen/').then((r) => r.data),

  pagosDisponibles: (params) =>
    api.get('/facturacion/pagos_disponibles/', { params }).then((r) => r.data),

  pdfUrl: (id) =>
    `${process.env.NEXT_PUBLIC_API_URL}/facturacion/${id}/pdf/`,
}
