import { getTodayStats, getUserGoal } from '@/lib/actions';
import HomeClient from './HomeClient';

export default async function Page() {
  const [stats, goal] = await Promise.all([
    getTodayStats(),
    getUserGoal()
  ]);

  return <HomeClient initialStats={stats} initialGoal={goal} />;
}
