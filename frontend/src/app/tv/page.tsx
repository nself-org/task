import { TVListView } from '@/components/tv/tv-list-view';

export const metadata = {
  title: 'TV Mode - ɳDemo',
  description: 'Large-screen family chore board',
};

/**
 * TV Mode Page
 *
 * Optimized for:
 * - Android TV, Apple TV, Smart TVs
 * - Large screens (10+ feet viewing distance)
 * - D-pad/remote navigation
 * - Family chore boards
 *
 * Access: /tv
 */
export default function TVPage() {
  return <TVListView />;
}
