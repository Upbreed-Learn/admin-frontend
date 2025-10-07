import { MoreVertical } from 'lucide-react';

const Subscriber = () => {
  return (
    <div className="flex basis-full flex-col gap-2.5 rounded-lg px-5 py-11 shadow-[0px_2.03px_2.03px_0px_#0000000A]">
      <button className="flex size-5 cursor-pointer items-center justify-center self-end transition-transform active:scale-95">
        <MoreVertical className="text-[#A3A3A3]" />
      </button>
      <div className="flex items-center gap-8">
        <SubscriberChart />
        <div className="flex flex-col gap-3">
          <div className="flex items-end gap-4">
            <p className="w-full max-w-[3.4375rem] text-right text-[9.14px]/[100%] font-semibold text-[#305B43]">
              Total Subscribers
            </p>
            <p className="text-[2rem]/[100%] font-bold text-[#00230F]">10M</p>
          </div>
          <div className="flex items-center gap-4">
            <p className="w-full max-w-[3.4375rem] text-right text-[9.14px]/[100%] font-semibold text-[#305B43]">
              Total Users
            </p>
            <p className="text-[2rem]/[100%] font-bold text-[#00230F]">10.7M</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscriber;

function SubscriberChart() {
  const totalUsers = 5;
  const totalSubscribers = 2;
  const subscriberPercentage = (totalSubscribers / totalUsers) * 100;
  const nonSubscriberPercentage = 100 - subscriberPercentage;

  return (
    <div className="relative size-[7.125rem]">
      <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90 transform">
        {/* Non-subscriber segment (light blue) */}
        <circle
          cx="100"
          cy="100"
          r="70"
          fill="none"
          stroke="#2D9CDB26"
          strokeWidth="40"
          strokeDasharray={`${nonSubscriberPercentage * 4.398} 439.8`}
        />

        {/* Subscriber segment (dark green) */}
        <circle
          cx="100"
          cy="100"
          r="70"
          fill="none"
          stroke="#305B43"
          strokeWidth="40"
          strokeDasharray={`${subscriberPercentage * 4.398} 439.8`}
          strokeDashoffset={`-${nonSubscriberPercentage * 4.398}`}
        />
      </svg>
    </div>
  );
}
