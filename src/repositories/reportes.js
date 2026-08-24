import api from '@/services/api'

export const reportesRepository = {
  ingresos: (params) =>
    api.get('/reportes/ingresos/', { params }).then((r) => r.data),

  citas: (params) =>
    api.get('/reportes/citas/', { params }).then((r) => r.data),

  pacientes: (params) =>
    api.get('/reportes/pacientes/', { params }).then((r) => r.data),

  ocupacion: (params) =>
    api.get('/reportes/ocupacion/', { params }).then((r) => r.data),

  diagnosticos: (params) =>
    api.get('/reportes/diagnosticos/', { params }).then((r) => r.data),
}
