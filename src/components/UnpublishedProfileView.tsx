import React from 'react';
import { Lock, ArrowLeft, LayoutDashboard, Globe } from 'lucide-react';

interface UnpublishedProfileViewProps {
  username: string;
  isLoggedIn?: boolean;
  onGoHome: () => void;
  onGoDashboard?: () => void;
}

export const UnpublishedProfileView: React.FC<UnpublishedProfileViewProps> = ({
  username,
  isLoggedIn = false,
  onGoHome,
  onGoDashboard,
}) => {
  return (
    <div className="min-h-full flex-1 flex items-center justify-center p-6 bg-[#FAF8F5] text-[#1C1B18] font-sans-ui">
      <div className="max-w-md w-full bg-white border border-[#E8E4D9] rounded-3xl p-8 sm:p-10 text-center shadow-lg space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto shadow-2xs">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono-code font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 inline-block">
            Private Profile
          </span>
          <h2 className="font-serif-display text-2xl sm:text-3xl font-normal text-[#1C1B18]">
            @{username} is Unpublished
          </h2>
          <p className="text-xs sm:text-sm text-[#6B665E] leading-relaxed max-w-sm mx-auto">
            This creator has set their profile to private or draft mode. It is not currently accessible to the public.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2.5">
          {isLoggedIn && onGoDashboard && (
            <button
              onClick={onGoDashboard}
              className="w-full py-2.5 px-4 bg-[#1C1B18] text-[#FAF8F5] hover:bg-[#33312B] text-xs font-medium rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-[#D49A3E]" />
              <span>Open My Creator Workspace</span>
            </button>
          )}

          <button
            onClick={onGoHome}
            className="w-full py-2.5 px-4 border border-[#E8E4D9] hover:border-[#1C1B18] text-xs font-medium rounded-xl text-[#1C1B18] hover:bg-[#FAF8F5] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Conn Home</span>
          </button>
        </div>

        <div className="pt-4 border-t border-[#E8E4D9] text-xs text-[#6B665E] font-mono-code">
          Conn. — Living Personal Identity System
        </div>
      </div>
    </div>
  );
};

