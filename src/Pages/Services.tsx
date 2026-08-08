interface ServicesProps {
  onSelectService: (serviceName: string) => void;
}

export default function Services({ onSelectService }: ServicesProps) {
  const servicesList = [

    { name: 'Standard Parcel Delivery', icon: '📦', desc: 'Scheduled shipping for large boxes and cargo shipments.' },
    { name: 'Outstation Bidding', icon: '🛣️', desc: 'Negotiate fare directly with drivers via call.' },
    { name: 'Sifting Experts ', icon: '🏠', desc: 'Seamless Pre-Move Survey & Moving' },
    { name: 'Local Adda', icon: '🛵', desc: 'Quick courier service using local riders.' },
  ];

  return (
    <div className="flex flex-col flex-1 animate-fade-in pb-20 w-full max-w-7xl mx-auto px-6 py-6">
      <div className="pb-4 border-b border-[#E0E0E0] mb-8">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Select Service</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {servicesList.map((service) => (
          <div
            key={service.name}
            className="bg-white border border-[#E0E0E0] hover:border-[#00B14F] hover:shadow-md rounded-2xl p-6 cursor-pointer active:scale-[0.99] transition-all flex flex-col justify-between min-h-[200px]"
            onClick={() => onSelectService(service.name)}
          >
            <div>
              <div className="w-12 h-12 bg-[#E6F6EE] rounded-full flex items-center justify-center text-xl mb-4 text-[#00B14F]">
                {service.icon}
              </div>
              <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">{service.name}</h3>
              <p className="text-sm text-[#666666] leading-relaxed">{service.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
