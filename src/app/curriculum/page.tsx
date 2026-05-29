import { fetchCurriculumYearData } from '@/lib/curriculum-actions';
import { CurriculumExplorer } from './curriculum-explorer';

export default async function CurriculumPage() {
  const initialYear = 0;
  const initialYearData = await fetchCurriculumYearData(initialYear);

  return (
    <CurriculumExplorer
      initialYear={initialYear}
      initialYearData={initialYearData}
    />
  );
}
