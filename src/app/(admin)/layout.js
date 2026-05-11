/**
 * Admin Layout
 * For admin panel routes
 * Requires admin authentication
 */
export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
