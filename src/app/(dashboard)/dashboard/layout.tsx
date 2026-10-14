/**
 * Nested under (dashboard)/layout.tsx which already provides DashboardShell.
 * Do NOT wrap DashboardShell here or you get a double sidebar.
 */
export default function DashboardSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
