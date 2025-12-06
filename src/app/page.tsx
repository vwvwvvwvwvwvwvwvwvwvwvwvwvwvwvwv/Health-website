import { getTodayStats, getUserGoal } from '@/lib/actions';
import HomeClient from './HomeClient';
import { unstable_noStore } from 'next/cache';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

export default async function Page() {
  unstable_noStore();
  const [stats, goal] = await Promise.all([
    getTodayStats(),
    getUserGoal()
  ]);

  return <HomeClient initialStats={stats} initialGoal={goal} />;
}
