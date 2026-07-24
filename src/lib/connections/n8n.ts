export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
}

export interface N8nExecution {
  id: string;
  workflowId: string;
  status: string;
  startedAt: string;
  stoppedAt: string | null;
  error?: string;
}

export async function testN8nConnection(
  baseUrl: string,
  apiKey: string
) {
  const response = await fetch(
    `${baseUrl.replace(/\/$/, "")}/api/v1/workflows`,
    {
      headers: {
        "X-N8N-API-KEY": apiKey,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Invalid API key or URL");
  }

  return true;
}

export async function getN8nWorkflows(
  baseUrl: string,
  apiKey: string
): Promise<N8nWorkflow[]> {
  const response = await fetch(
    `${baseUrl.replace(/\/$/, "")}/api/v1/workflows`,
    {
      headers: {
        "X-N8N-API-KEY": apiKey,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Unable to fetch workflows");
  }

  const json = await response.json();

  return json.data || [];
}
export async function getN8nExecutions(
  baseUrl: string,
  apiKey: string
): Promise<N8nExecution[]> {

  const response = await fetch(
    `${baseUrl.replace(/\/$/, "")}/api/v1/executions?limit=50`,
    {
      headers: {
        "X-N8N-API-KEY": apiKey,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Unable to fetch executions");
  }

  const json = await response.json();

  return json.data || [];
}