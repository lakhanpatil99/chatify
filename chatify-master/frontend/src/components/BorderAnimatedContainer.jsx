// How to make animated gradient border 👇
// https://cruip-tutorials.vercel.app/animated-gradient-border/
function BorderAnimatedContainer({ children }) {
  return (
    <div className="w-full h-full [background:linear-gradient(45deg,theme(colors.base-100),theme(colors.base-200)_50%,theme(colors.base-100))_padding-box,conic-gradient(from_var(--border-angle),theme(colors.base-content/.1)_80%,_theme(colors.primary)_86%,_theme(colors.secondary)_90%,_theme(colors.primary)_94%,_theme(colors.base-content/.1))_border-box] rounded-2xl border border-transparent animate-border  flex overflow-hidden">
      {children}
    </div>
  );
}
export default BorderAnimatedContainer;
