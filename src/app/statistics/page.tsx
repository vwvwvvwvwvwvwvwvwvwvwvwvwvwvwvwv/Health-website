import { getWeeklyStats, getMonthlyStats } from '@/lib/actions';
import StatisticsClient from './StatisticsClient';

export default async function StatisticsPage() {
  const [weeklyStats, monthlyStats] = await Promise.all([
    getWeeklyStats(),
    getMonthlyStats()
  ]);

  return <StatisticsClient weeklyStats={weeklyStats} monthlyStats={monthlyStats} />;
}



