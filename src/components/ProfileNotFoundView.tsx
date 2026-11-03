import React from 'react';
import { UserX, ArrowLeft, PlusCircle, Sparkles } from 'lucide-react';

interface ProfileNotFoundViewProps {
  username: string;
  onGoHome: () => void;
  onClaimUsername?: (username: string) => void;
}

export const ProfileNotFoundView: React.FC<ProfileNotFoundViewProps> = ({
  username,
  onGoHome,
  onClaimUsername,
}) => {
  return (
    <div className="min-h-full flex-1 flex items-center justify-center p-6 bg-[#FAF8F5] text-[#1C1B18] font-sans-ui">
      <div className="max-w-md w-full bg-white border border-[#E8E4D9] rounded-3xl p-8 sm:p-10 text-center shadow-lg space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#FAF8F5] border border-[#E8E4D9] text-[#C85A32] flex items-center justify-center mx-auto shadow-2xs">
          <UserX className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-mono-code font-bold uppercase tracking-widest text-[#C85A32] bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200 inline-block">
            404 • Not Found
          </span>
          <h2 className="font-serif-display text-2xl sm:text-3xl font-normal text-[#1C1B18]">
            @{username} doesn&apos;t exist
          </h2>
          <p className="text-xs sm:text-sm text-[#6B665E] leading-relaxed max-w-sm mx-auto">
            The profile handle <strong className="text-[#1C1B18]">conn.bio/{username}</strong> has not been registered or claimed yet.
          </p>
        </div>

        <div className="p-4 bg-[#FAF8F5] border border-[#E8E4D9] rounded-2xl text-left space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1C1B18]">
            <Sparkles className="w-3.5 h-3.5 text-[#D49A3E]" />
            <span>This handle may be available!</span>
          </div>
          <p className="text-[11px] text-[#6B665E]">
            Create your personalized Conn Linktree profile now and claim this username for yourself.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2.5">
          {onClaimUsername && (
            <button
              onClick={() => onClaimUsername(username)}
              className="w-full py-2.5 px-4 bg-[#1C1B18] text-[#FAF8F5] hover:bg-[#33312B] text-xs font-medium rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#D49A3E]" />
              <span>Claim @{username} on Conn</span>
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

        <div className="pt-4 border-t border-[#E8E4D9] text-[11px] text-[#6B665E] font-mono-code">
          Conn. — Living Personal Identity System
        </div>
      </div>
    </div>
  );
};

