export interface AnomalyRow {
  route: string;
  week_of: string;
  cost_per_tonne_km: string;
  vs_own_history: string;
  vs_similar_routes: string;
  flagged: "Yes" | "No (justified)";
  matched_note_id: string;
  reason: string;
  route_type?: string;
  shipment_count?: number;
  total_cost_inr?: number;
  total_tonne_km?: number;
  retrieved_notes_count?: number;
  guardrail_status?: string;
}

export interface RouteSeriesPoint {
  week_of: string;
  cost_per_tonne_km: number;
  own_baseline: number | null;
  peer_baseline: number | null;
  is_anomaly: boolean;
  flagged_status: "Yes" | "No (justified)" | null;
}

export interface RouteData {
  route: string;
  route_type: "Short" | "Medium" | "Long";
  origin: string;
  destination: string;
  series: RouteSeriesPoint[];
}

export interface ContextNote {
  note_id: string;
  date: string;
  applies_to: string;
  note: string;
}

export interface ReproducibilityReport {
  runs_count: number;
  is_reproducible: boolean;
  run1_sha256: string;
  run2_sha256: string;
  run3_sha256: string;
  field_mismatches: number;
  total_rows: number;
  justified_count: number;
  unexplained_count: number;
}

export interface GuardrailTestCase {
  test_case?: string;
  note_tested?: string;
  note_id?: string;
  description?: string;
  route: string;
  week_of: string;
  verdict: string;
  matched_note_id: string;
  guardrail_passed?: boolean;
  passed?: boolean;
}

export interface GuardrailEval {
  all_passed?: boolean;
  all_guardrails_passed?: boolean;
  tests_run?: number;
  passed_count?: number;
  results?: GuardrailTestCase[];
  test_results?: GuardrailTestCase[];
}


export interface Telemetry {
  model_name: string;
  total_llm_calls: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_tokens: number;
  estimated_cost_usd: number;
  input_rate_per_million: string;
  output_rate_per_million: string;
}

export interface FreightDataPayload {
  summary: {
    total_shipments: number;
    total_routes: number;
    total_route_weeks: number;
    total_anomalies: number;
    justified_count: number;
    unexplained_count: number;
    date_range: {
      start: string;
      end: string;
    };
  };
  anomalies: AnomalyRow[];
  routes_data: Record<string, RouteData>;
  notes: ContextNote[];
  reproducibility: ReproducibilityReport;
  guardrail_eval: GuardrailEval;
  telemetry: Telemetry;
}
