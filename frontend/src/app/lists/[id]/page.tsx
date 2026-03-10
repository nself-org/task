import type { Metadata } from 'next';
import { ListPageContent } from './content';

export const metadata: Metadata = {
  title: 'List | ɳDemo',
  description: 'Collaborative todo lists with real-time updates',
};

// Required for Next.js output: 'export' (Capacitor builds).
// Next.js 15 requires at least one prerendered route — we use a placeholder.
// At runtime, client-side routing navigates to real list IDs from the app.
export function generateStaticParams(): Array<{ id: string }> {
  return [{ id: '_' }];
}
export const dynamicParams = false;

export default async function ListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ListPageContent listId={id} />;
}
