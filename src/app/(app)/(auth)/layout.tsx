/**
 * Centered auth shell (matches the design export): a single column on white,
 * the form (sign-up / log-in / reset) centered in the viewport.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10 vg-fade">
      <div className="w-full max-w-[380px]">{children}</div>
    </div>
  );
}
