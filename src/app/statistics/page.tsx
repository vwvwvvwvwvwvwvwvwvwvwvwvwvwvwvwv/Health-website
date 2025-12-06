import { getWeeklyStats, getMonthlyStats } from '@/lib/actions';
import StatisticsClient from './StatisticsClient';

export const dynamic = 'force-dynamic';

export default async function StatisticsPage() {
  const [weeklyStats, monthlyStats] = await Promise.all([
    getWeeklyStats(),
    getMonthlyStats()
  ]);

  return <StatisticsClient weeklyStats={weeklyStats} monthlyStats={monthlyStats} />;
}




