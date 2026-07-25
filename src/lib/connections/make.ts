// src/lib/integrations/make.ts
//
// Make (formerly Integromat) API v2. Docs: https://developers.make.com/api-documentation
//
// Auth header is `Authorization: Token <token>` (NOT Bearer). The base URL
// is zone-specific — a Make account lives on a region, e.g.
// https://eu1.make.com or https://us1.make.com. Your connect form for Make
// needs a zone-url field AND a numeric Make team ID field (visible in the
// user's Make account URL), not just a single API key like n8n.
//
// Make calls a workflow a "scenario." Execution history is per-scenario via
// GET /scenarios/{id}/logs — there's no single global executions feed like
// n8n has, so importing status requires one call per scenario.

export interface MakeScenario {
  id: number;
  name: string;
  isActive: boolean;
}

export interface MakeScenarioLog {
  id: string;
  imtId: string;
  status: 1 | 2 | 3; // 1 = success, 2 = warning, 3 = error
  timestamp: string;
}

function apiUrl(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/$/, "")}/api/v2${path}`;
}

export async function testMakeConnection(
  baseUrl: string,
  apiToken: string,
  makeTeamId: string
) {
  const response = await fetch(
    apiUrl(baseUrl, `/scenarios?teamId=${makeTeamId}&pg[limit]=1`),
    { headers: { Authorization: `Token ${apiToken}` } }
  );

  if (!response.ok) {
    throw new Error("Invalid API token, team ID, or zone URL");
  }
  return true;
}

export async function getMakeScenarios(
  baseUrl: string,
  apiToken: string,
  makeTeamId: string
): Promise<MakeScenario[]> {
  const response = await fetch(
    apiUrl(baseUrl, `/scenarios?teamId=${makeTeamId}`),
    { headers: { Authorization: `Token ${apiToken}` } }
  );

  if (!response.ok) {
    throw new Error("Unable to fetch scenarios");
  }

  const json = await response.json();
  return json.scenarios || [];
}

export async function getMakeScenarioLogs(
  baseUrl: string,
  apiToken: string,
  scenarioId: string | number
): Promise<MakeScenarioLog[]> {
  const response = await fetch(
    apiUrl(baseUrl, `/scenarios/${scenarioId}/logs?pg[limit]=20`),
    { headers: { Authorization: `Token ${apiToken}` } }
  );

  if (!response.ok) {
    // Don't throw — skip this scenario so one bad ID doesn't fail the whole sync
    return [];
  }

  const json = await response.json();
  return json.scenarioLogs || [];
}

export function normalizeMakeStatus(
  status: MakeScenarioLog["status"]
): "success" | "error" {
  return status === 3 ? "error" : "success";
}
