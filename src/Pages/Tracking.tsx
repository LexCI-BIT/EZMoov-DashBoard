import { useState, useEffect } from 'react';

interface TrackingProps {
  serviceName: string;
  onBack: () => void;
}

export default function Tracking({ serviceName, onBack }: TrackingProps) {
  const isShifting = serviceName.trim() === 'Sifting Experts';
  const isBidding = serviceName.trim() === 'Outstation Bidding';

  // Multi-phase tracking state for shifting experts: 'survey' | 'delivery'
  const [shiftingPhase, setShiftingPhase] = useState<'survey' | 'delivery'>('survey');

  // State state flow based on service type
  const [shiftingState, setShiftingState] = useState<'booked' | 'assigned' | 'arrived' | 'inspecting' | 'completed'>('booked');
  const [biddingState, setBiddingState] = useState<'placed' | 'accepted' | 'arrived' | 'transit' | 'completed'>('placed');
  const [standardState, setStandardState] = useState<'assigned' | 'arrived_pickup' | 'picked_up' | 'in_transit' | 'delivered'>('assigned');

  // Define timelines
  const shiftingSurveySteps = [
    { key: 'booked', title: 'Survey Booked', desc: 'Pre-move survey has been registered.' },
    { key: 'assigned', title: 'Surveyor Assigned', desc: 'Raj Kumar is on the way.' },
    { key: 'arrived', title: 'Surveyor Arrived', desc: 'Executive has reached your location.' },
    { key: 'inspecting', title: 'Inspecting Items', desc: 'Listing inventory and estimating vehicle capacities.' },
    { key: 'completed', title: 'Survey Completed', desc: 'Inventory finalized and quote sent.' },
  ];

  const shiftingDeliverySteps = [
    { key: 'assigned', title: 'Movers Assigned', desc: 'Shifting crew and transport vehicle are on the way.' },
    { key: 'arrived_pickup', title: 'Arrived for Loading', desc: 'Crew is packing and loading goods into the vehicle.' },
    { key: 'picked_up', title: 'Goods Loaded', desc: 'Move started. OTP verified.' },
    { key: 'in_transit', title: 'On the Way', desc: 'Heading to your new destination address.' },
    { key: 'delivered', title: 'Delivered', desc: 'Items delivered and unpacked successfully.' },
  ];

  const biddingSteps = [
    { key: 'placed', title: 'Bid Placed', desc: 'Your bid offer has been broadcast.' },
    { key: 'accepted', title: 'Bid Accepted', desc: 'Raj Kumar accepted the negotiated fare.' },
    { key: 'arrived', title: 'Driver Arrived', desc: 'Driver is loading the outstation cargo.' },
    { key: 'transit', title: 'In Transit', desc: 'Heading to outstation destination.' },
    { key: 'completed', title: 'Delivered', desc: 'Cargo reached destination safely.' },
  ];

  const standardSteps = [
    { key: 'assigned', title: 'Driver Assigned', desc: 'Raj Kumar is on the way to pickup' },
    { key: 'arrived_pickup', title: 'Arrived at Pickup', desc: 'Driver is waiting at pickup location' },
    { key: 'picked_up', title: 'Picked Up', desc: 'Parcel picked up. OTP verified.' },
    { key: 'in_transit', title: 'On the Way', desc: 'Heading to drop-off location' },
    { key: 'delivered', title: 'Delivered', desc: 'Parcel delivered successfully. Ride Completed.' },
  ];

  const getTimelineSteps = () => {
    if (isShifting) {
      return shiftingPhase === 'survey' ? shiftingSurveySteps : shiftingDeliverySteps;
    }
    if (isBidding) return biddingSteps;
    return standardSteps;
  };

  const getActiveState = () => {
    if (isShifting) {
      return shiftingPhase === 'survey' ? shiftingState : standardState;
    }
    if (isBidding) return biddingState;
    return standardState;
  };

  const advanceTripState = () => {
    if (isShifting) {
      if (shiftingPhase === 'survey') {
        const order = ['booked', 'assigned', 'arrived', 'inspecting', 'completed'];
        const nextIdx = order.indexOf(shiftingState) + 1;
        if (nextIdx < order.length) {
          setShiftingState(order[nextIdx] as any);
        }
      } else {
        const order = ['assigned', 'arrived_pickup', 'picked_up', 'in_transit', 'delivered'];
        const nextIdx = order.indexOf(standardState) + 1;
        if (nextIdx < order.length) {
          setStandardState(order[nextIdx] as any);
        }
      }
    } else if (isBidding) {
      const order = ['placed', 'accepted', 'arrived', 'transit', 'completed'];
      const nextIdx = order.indexOf(biddingState) + 1;
      if (nextIdx < order.length) {
        setBiddingState(order[nextIdx] as any);
      }
    } else {
      const order = ['assigned', 'arrived_pickup', 'picked_up', 'in_transit', 'delivered'];
      const nextIdx = order.indexOf(standardState) + 1;
      if (nextIdx < order.length) {
        setStandardState(order[nextIdx] as any);
      }
    }
  };

  // Automated Tracking State Simulation
  useEffect(() => {
    const currentState = getActiveState();
    if (currentState === 'completed' || currentState === 'delivered') {
      if (isShifting && shiftingPhase === 'survey' && shiftingState === 'completed') {
        const timer = setTimeout(() => {
          setShiftingPhase('delivery');
          setStandardState('assigned');
        }, 4000);
        return () => clearTimeout(timer);
      }
      return;
    }

    const timer = setTimeout(() => {
      advanceTripState();
    }, 4000);

    return () => clearTimeout(timer);
  }, [shiftingPhase, shiftingState, biddingState, standardState, isShifting, isBidding]);

  const getTimelineClass = (stepKey: string) => {
    const steps = isShifting
      ? (shiftingPhase === 'survey' ? ['booked', 'assigned', 'arrived', 'inspecting', 'completed'] : ['assigned', 'arrived_pickup', 'picked_up', 'in_transit', 'delivered'])
      : isBidding
        ? ['placed', 'accepted', 'arrived', 'transit', 'completed']
        : ['assigned', 'arrived_pickup', 'picked_up', 'in_transit', 'delivered'];

    const stepIndex = steps.indexOf(stepKey);
    const currentIndex = steps.indexOf(getActiveState() as string);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return '';
  };

  const showOTPBox = () => {
    const currentState = getActiveState();
    if (isShifting) {
      if (shiftingPhase === 'survey') {
        return currentState === 'assigned';
      } else {
        return currentState !== 'delivered';
      }
    } else if (isBidding) {
      return false;
    } else {
      return currentState !== 'delivered';
    }
  };

  const getOTPLabel = () => {
    if (isShifting && shiftingPhase === 'survey') return 'Survey Verification OTP';
    const currentState = getActiveState();
    return currentState === 'assigned' || currentState === 'arrived_pickup' ? 'Loading OTP' : 'Delivery OTP';
  };

  const getOTPNumber = () => {
    if (isShifting && shiftingPhase === 'survey') return '7712';
    const currentState = getActiveState();
    return currentState === 'assigned' || currentState === 'arrived_pickup' ? '4392' : '8821';
  };

  const getDriverRoleText = () => {
    if (isShifting) {
      return shiftingPhase === 'survey' ? 'Survey Associate' : 'Shifting & Movers Team';
    }
    return 'Vehicle Partner';
  };

  const steps = getTimelineSteps();

  return (
    <div className="flex flex-col flex-1 animate-fade-in w-full max-w-7xl mx-auto px-6 py-6 pb-20">
      {/* Header */}
      <div className="pb-4 border-b border-[#E0E0E0] mb-8 flex items-center min-h-[56px] w-full">
        <button
          onClick={onBack}
          className="text-2xl text-[#1A1A1A] mr-4 cursor-pointer bg-none border-none p-0 line-height-1"
        >
          ←
        </button>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">
          {isShifting
            ? (shiftingPhase === 'survey' ? 'Survey Progress (#SRV98)' : 'Shifting & Moving Progress (#MOV45)')
            : 'Order Tracking (#12345)'}
        </h1>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
        {/* Left Side: Drivers, OTP, Timeline */}
        <div className="lg:col-span-7 space-y-6">
          {/* Driver Card */}
          <div className="bg-white border border-[#E0E0E0] rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 bg-[#00B14F] text-white rounded-full flex items-center justify-center text-lg font-bold">
              {isShifting ? (shiftingPhase === 'survey' ? 'SA' : 'MC') : 'RK'}
            </div>
            <div className="flex-1">
              <h4 className="text-base font-bold text-[#1A1A1A]">
                {isShifting
                  ? (shiftingPhase === 'survey' ? 'Suresh Kumar' : 'EZmoov Movers Crew')
                  : 'Raj Kumar'}
              </h4>
              <p className="text-xs text-[#666666]">
                {isShifting
                  ? (shiftingPhase === 'survey' ? 'EZmoov Certified Inspector' : 'Tata Ace Cargo • DL 02 CC 9876')
                  : 'DL 01 AB 1234 • Honda Activa'}
              </p>
              <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-semibold mt-1 inline-block uppercase">
                {getDriverRoleText()}
              </span>
            </div>
            <button className="w-10 h-10 bg-white border border-[#00B14F] text-[#00B14F] hover:bg-[#E6F6EE] rounded-full flex items-center justify-center text-lg cursor-pointer transition-colors">
              📞
            </button>
          </div>

          {/* OTP Box */}
          {showOTPBox() && (
            <div className="bg-[#E6F6EE] border border-dashed border-[#00B14F] rounded-2xl p-5 text-center shadow-sm">
              <div className="text-xs text-[#00B14F] font-bold uppercase tracking-wider mb-1">
                {getOTPLabel()}
              </div>
              <div className="text-3xl font-bold text-[#1A1A1A] tracking-[4px]">
                {getOTPNumber()}
              </div>
            </div>
          )}

          {/* Timeline Card */}
          <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-6 text-[#1A1A1A]">
              {isShifting
                ? (shiftingPhase === 'survey' ? 'Survey Progress Timeline' : 'Move Day Progress Timeline')
                : 'Delivery Progress'}
            </h3>
            <div className="space-y-0">
              {steps.map((step, idx) => {
                const stepClass = getTimelineClass(step.key);
                return (
                  <div key={step.key} className="flex gap-4 pb-8 relative">
                    <div className="flex flex-col items-center">
                      <div className={`w-5 h-5 rounded-full border-2 bg-white z-[2] shrink-0 transition-all ${stepClass === 'completed'
                          ? 'bg-[#00B14F] border-[#00B14F]'
                          : stepClass === 'active'
                            ? 'border-[#00B14F] ring-4 ring-[#E6F6EE]'
                            : 'border-[#E0E0E0]'
                        }`} />
                      {idx < steps.length - 1 && (
                        <div className={`w-0.5 h-full absolute top-[18px] z-[1] ${stepClass === 'completed' ? 'bg-[#00B14F]' : 'bg-[#E0E0E0]'
                          }`} />
                      )}
                    </div>
                    <div className="timeline-content">
                      <h4 className="text-sm font-bold text-[#1A1A1A] mb-0.5">{step.title}</h4>
                      <p className="text-xs text-[#666666]">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Map view mockup */}
        <div className="lg:col-span-5 space-y-6">
          <div className="h-[360px] bg-[#E0E0E0] rounded-2xl flex items-center justify-center text-sm font-medium text-[#666666] shadow-sm border border-[#E0E0E0]">
            {isShifting
              ? (shiftingPhase === 'survey' ? 'Survey Site Location Area' : 'Live Shifting Route Map')
              : 'Live Route Map'}
          </div>

          {isBidding && (
            <button className="w-full py-4 border-2 border-[#00B14F] text-[#00B14F] hover:bg-[#E6F6EE] bg-white rounded-xl text-base font-bold uppercase tracking-wide cursor-pointer transition-colors">
              Call Driver to Negotiate
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
