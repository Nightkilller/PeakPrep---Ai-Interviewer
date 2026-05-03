import { getTranscription } from '@/lib/actions/general.action';
import ReportClient from './ReportClient';
import { RouteParams } from '@/app/types';

export default async function ResultPage({ params }: RouteParams) {
  const { id } = await params;
  const data = await getTranscription(id);
  
  if (!data || !data.assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Report Processing</h2>
          <p className="text-gray-500">Your interview is being analyzed. Please wait or check back in a few minutes.</p>
        </div>
      </div>
    );
  }

  // Merge the context from `data` into `assessment` if needed, 
  // but the Groq JSON schema specifies most things inside `assessment`.
  // We'll pass the whole data object just in case we need `position`, etc.
  
  return <ReportClient data={data} assessment={data.assessment} />;
}
