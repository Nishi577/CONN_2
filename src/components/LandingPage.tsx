import React, { useState } from 'react';
import { ConnProfile } from '../types';
import { SAMPLE_PROFILES } from '../data/mockData';
import { PublicProfile } from './PublicProfile';
import {
  ArrowRight,
  Sparkles,
  Palette,
  Layout,
  BarChart2,
  Lock,
  Globe,
  Check,
  Zap,
} from 'lucide-react';

interface LandingPageProps {
  onSignUp: () => void;
  onLogin: () => void;
  onSelectSampleProfile: (profile: ConnProfile) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onSignUp,
  onLogin,
  onSelectSampleProfile,
}) => {
  const [activeHeroProfile, setActiveHeroProfile] = useState<ConnProfile>(SAMPLE_PROFILES[0]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1B18] font-sans-ui selection:bg-[#E8E4D9]">
      {/* Top Header Navbar */}
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-b border-[#E8E4D9]/60">
        <div className="flex items-center gap-3">
          <span className="font-serif-display text-3xl font-normal tracking-tight text-[#1C1B18]">
            Conn.
          </span>
          <span className="hidden sm:inline text-xs uppercase font-mono-code px-2.5 py-0.5 rounded-full border border-[#E8E4D9] text-[#6B665E]">
            Editorial Profiles
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onLogin}
            className="text-xs font-medium text-[#6B665E] hover:text-[#1C1B18] px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5 opacity-60" />
            <span>Log In</span>
          </button>
          <button
            onClick={onSignUp}
            className="px-4 py-2 bg-[#1C1B18] text-[#FAF8F5] hover:bg-[#33312B] text-xs font-medium rounded-xl transition-all shadow-2xs hover:scale-102 flex items-center gap-1.5"
          >
            <span>Sign Up Free</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section: Product as Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-12 sm:pt-20 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Copy */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E8E4D9]/40 border border-[#E8E4D9] rounded-full text-[11px] font-mono-code text-[#6B665E]">
              <span className="w-2 h-2 rounded-full bg-[#C85A32]" />
              <span>A personal space on the internet.</span>
            </div>

            <h1 className="font-serif-display text-5xl sm:text-6xl lg:text-7xl font-normal leading-[1.05] tracking-tight text-[#1C1B18]">
              Restrained, editorial link-in-bio profiles.
            </h1>

            <p className="text-sm sm:text-base text-[#6B665E] leading-relaxed font-light">
              Conn replaces generic SaaS link trees with quietly premium, typography-driven personal spaces. Curate your essays, projects, music, and newsletters without visual clutter.
            </p>

            {/* Profile Sample Selector Pills */}
            <div className="pt-2">
              <span className="block text-[11px] font-mono-code uppercase tracking-wider text-[#6B665E] mb-2.5">
                Inspect Live Sample Profiles:
              </span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_PROFILES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActiveHeroProfile(p)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      activeHeroProfile.id === p.id
                        ? 'bg-[#1C1B18] text-[#FAF8F5] border-[#1C1B18]'
                        : 'bg-white text-[#6B665E] border-[#E8E4D9] hover:border-[#1C1B18]'
                    }`}
                  >
                    @{p.username}
                  </button>
                ))}
              </div>
            </div>

            {/* Authentication CTA Group */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={onSignUp}
                className="px-6 py-3.5 bg-[#1C1B18] text-[#FAF8F5] hover:bg-[#33312B] text-xs font-medium rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:scale-102"
              >
                <span>Sign Up & Claim Your Handle</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onLogin}
                className="px-6 py-3.5 bg-white border border-[#E8E4D9] hover:border-[#1C1B18] text-xs font-medium rounded-xl text-[#1C1B18] transition-all text-center flex items-center justify-center gap-2 hover:bg-black/5"
              >
                <Lock className="w-3.5 h-3.5 opacity-60" />
                <span>Log In to Workspace</span>
              </button>
            </div>
          </div>

          {/* Interactive Hero Profile Showcase Frame */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="w-full max-w-md rounded-[36px] border-8 border-[#1C1B18] bg-white shadow-2xl overflow-hidden aspect-9/18 max-h-[720px] transition-all">
              <div className="w-full bg-[#1C1B18] h-5 flex justify-center items-center">
                <div className="w-16 h-2.5 bg-black rounded-b-lg" />
              </div>
              <div className="h-full overflow-y-auto">
                <PublicProfile
                  profile={activeHeroProfile}
                  onOpenShare={() => {}}
                  onShowToast={() => {}}
                  isEmbeddedPreview={true}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DESIGN PHILOSOPHY SECTION */}
      <section className="border-t border-[#E8E4D9] bg-[#F5F2EC] py-20">
        <div className="max-w-5xl mx-auto px-6 space-y-12">
          <div className="max-w-2xl space-y-3">
            <span className="text-[11px] font-mono-code uppercase tracking-widest text-[#C85A32] font-semibold">
              OUR PHILOSOPHY
            </span>
            <h2 className="font-serif-display text-4xl sm:text-5xl font-normal text-[#1C1B18]">
              Designed around restraint & typography.
            </h2>
            <p className="text-sm text-[#6B665E] leading-relaxed">
              We rejected gradients, glowing buttons, and generic SaaS templates to build a profile system that feels human.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-[#FAF8F5] border border-[#E8E4D9] rounded-2xl space-y-3">
              <div className="w-9 h-9 rounded-xl bg-[#1C1B18] text-[#FAF8F5] flex items-center justify-center">
                <Palette className="w-4 h-4" />
              </div>
              <h3 className="font-serif-display text-2xl font-normal text-[#1C1B18]">Editorial Palettes</h3>
              <p className="text-xs text-[#6B665E] leading-relaxed">
                Warm paper stone, studio ink, and sage botanical themes that treat your work like a published monograph.
              </p>
            </div>

            <div className="p-6 bg-[#FAF8F5] border border-[#E8E4D9] rounded-2xl space-y-3">
              <div className="w-9 h-9 rounded-xl bg-[#1C1B18] text-[#FAF8F5] flex items-center justify-center">
                <Layout className="w-4 h-4" />
              </div>
              <h3 className="font-serif-display text-2xl font-normal text-[#1C1B18]">Category Streams</h3>
              <p className="text-xs text-[#6B665E] leading-relaxed">
                Organize essays, projects, podcasts, and social profiles with distinct visual density and featured highlights.
              </p>
            </div>

            <div className="p-6 bg-[#FAF8F5] border border-[#E8E4D9] rounded-2xl space-y-3">
              <div className="w-9 h-9 rounded-xl bg-[#1C1B18] text-[#FAF8F5] flex items-center justify-center">
                <BarChart2 className="w-4 h-4" />
              </div>
              <h3 className="font-serif-display text-2xl font-normal text-[#1C1B18]">Quiet Analytics</h3>
              <p className="text-xs text-[#6B665E] leading-relaxed">
                Track views, link clicks, CTRs, and top performing content without cluttering your workflow with complex enterprise panels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA FOOTER */}
      <section className="py-20 max-w-4xl mx-auto px-6 text-center space-y-6">
        <h2 className="font-serif-display text-4xl sm:text-6xl font-normal text-[#1C1B18]">
          Create your space on Conn.
        </h2>
        <p className="text-sm text-[#6B665E] max-w-md mx-auto">
          No credit card required. Customize your profile in under 2 minutes.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onSignUp}
            className="px-8 py-4 bg-[#1C1B18] text-[#FAF8F5] hover:bg-[#33312B] text-xs font-medium rounded-2xl shadow-lg transition-all hover:scale-105 flex items-center gap-2"
          >
            <span>Create Your Profile — Sign Up Free</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onLogin}
            className="px-8 py-4 bg-white border border-[#E8E4D9] hover:border-[#1C1B18] text-[#1C1B18] text-xs font-medium rounded-2xl transition-all hover:scale-105 flex items-center gap-2"
          >
            <Lock className="w-3.5 h-3.5 opacity-60" />
            <span>Sign In to Existing Account</span>
          </button>
        </div>

        <footer className="pt-12 text-xs font-mono-code text-[#6B665E] border-t border-[#E8E4D9]">
          <p>© 2026 Conn. A quiet space on the internet.</p>
        </footer>
      </section>
    </div>
  );
};
