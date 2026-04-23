/**
 * Header Component - Premium Dark Theme
 * Features: Neon logo, dark-only theme, gradient background
 */

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-primary-500/20">
      <div className="max-w-6xl mx-auto px-4 py-4 md:py-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <span className="text-3xl md:text-4xl animate-float">✨</span>
          <div className="flex flex-col">
            <h1 className="neon-text text-xl md:text-2xl font-bold">
              Smart FAQ
            </h1>
            <p className="text-xs text-primary-400/60">AI-Powered Assistant</p>
          </div>
        </div>

        {/* Subtitle - Hidden on mobile */}
        <div className="hidden md:block text-right">
          <p className="text-white/60 text-sm">
            Dark Mode <span className="text-primary-400">●</span> Always On
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
