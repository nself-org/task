import TodoViewClient from './TodoViewClient';

// Required for Next.js output: 'export' (Capacitor builds).
// Next.js 15 requires at least one prerendered route — we use a placeholder.
// At runtime, client-side routing navigates to real todo IDs from the app.
export function generateStaticParams(): Array<{ id: string }> {
  return [{ id: '_' }];
}
export const dynamicParams = false;

export default function TodoViewPage() {
  return <TodoViewClient />;
}
