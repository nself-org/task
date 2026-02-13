import type { Metadata } from 'next';
import { ListPageContent } from './content';

export const metadata: Metadata = {
  title: 'List | ɳDemo',
  description: 'Collaborative todo lists with real-time updates',
};

export default async function ListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ListPageContent listId={id} />;
}
