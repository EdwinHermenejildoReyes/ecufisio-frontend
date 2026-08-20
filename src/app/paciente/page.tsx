export default function PortalPacientePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-sky-600 mb-6">Mi portal</h1>
        <div className="grid gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-1">Mis citas</h2>
            <p className="text-sm text-gray-500">Ver y gestionar tus próximas citas</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-1">Mis ejercicios</h2>
            <p className="text-sm text-gray-500">Rutinas asignadas por tu fisioterapeuta</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-1">Mis facturas</h2>
            <p className="text-sm text-gray-500">Descargar tus comprobantes de pago</p>
          </div>
        </div>
      </div>
    </div>
  )
}
