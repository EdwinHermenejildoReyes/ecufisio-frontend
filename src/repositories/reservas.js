import api from '@/services/api'

export const reservasRepository = {
  obtenerFisioterapeuta: (id) =>
    api.get(`/reservas/fisioterapeuta/${id}/`).then((r) => r.data),

  listarServicios: () =>
    api.get('/reservas/servicios/').then((r) => r.data),

  obtenerSlots: (fisioId, fecha, servicioId) =>
    api.get('/reservas/slots/', {
      params: { fisio: fisioId, fecha, servicio: servicioId },
    }).then((r) => r.data),

  crearReserva: (data) =>
    api.post('/reservas/crear/', data).then((r) => r.data),
}
