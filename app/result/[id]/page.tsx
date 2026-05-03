import { getTranscription } from '@/lib/actions/general.action';
import ReportClient from './ReportClient';
import { RouteParams } from '@/app/types';

export const dynamic = "force-dynamic";

export default async function ResultPage({ params }: RouteParams) {
  const { id } = await params;
  const data = await getTranscription(id);
  
  return <ReportClient sessionId={id} data={data} initialAssessment={data?.assessment || null} />;
}
