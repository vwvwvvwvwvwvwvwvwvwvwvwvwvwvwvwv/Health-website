import { getWeeklyStats, getMonthlyStats } from '@/lib/actions';
import StatisticsClient from './StatisticsClient';
import { unstable_noStore } from 'next/cache';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

export default async function StatisticsPage() {
  unstable_noStore();
  const [weeklyStats, monthlyStats] = await Promise.all([
    getWeeklyStats(),
    getMonthlyStats()
  ]);

  return <StatisticsClient weeklyStats={weeklyStats} monthlyStats={monthlyStats} />;
}




