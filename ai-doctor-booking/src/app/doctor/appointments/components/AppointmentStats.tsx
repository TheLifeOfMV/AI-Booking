const AppointmentStats = ({ appointments }: { appointments: any[] }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="grid grid-cols-1 gap-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-dark-grey mb-2">
            {appointments.length}
          </div>
          <div className="text-medium-grey">
            citas encontradas
          </div>
        </div>
      </div>
    </div>
  );
}; 