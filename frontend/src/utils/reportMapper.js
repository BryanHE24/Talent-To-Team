export function mapReportData(rawReport) {
  // Normalize null or missing report gracefully to an empty resilient structure
  if (!rawReport) {
    return {
      candidate_recommendation: 'N/A',
      final_score: 'N/A',
      hr_summary: 'No report data available.',
      strengths: [],
      risks: [],
      category_scores: {},
      match_rationale: ''
    };
  }
  
  // Extract strictly the json from possible Supabase response node
  const reportObj = rawReport.report_json || rawReport || {};

  return {
    candidate_recommendation: reportObj.candidate_recommendation || 'Pending',
    final_score: reportObj.final_score ?? 'N/A',
    hr_summary: reportObj.hr_summary || 'No summary provided.',
    strengths: Array.isArray(reportObj.strengths) ? reportObj.strengths : [],
    risks: Array.isArray(reportObj.risks) ? reportObj.risks : [],
    category_scores: reportObj.category_scores || {},
    match_rationale: reportObj.match_rationale || ''
  };
}
