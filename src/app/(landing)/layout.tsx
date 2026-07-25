export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface text-white min-h-screen">
      {children}
    </div>
  );
}