"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Workflow {
  id: string;
  name: string;
  platform: string;
  status: string;
  last_snapshot_at: string | null;
}

interface Incident {
  id: string;
  error_message: string;
  detected_at: string;
  root_cause: string | null;
  confidence: number | null;
}

export default function AssistantDetailsPage() {
  const { id } = useParams();

  const [workflow, setWorkflow] =
    useState<Workflow | null>(null);

  const [incidents, setIncidents] =
    useState<Incident[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [workflowRes, incidentRes] =
          await Promise.all([
            fetch(`/api/workflows/${id}`),
            fetch(`/api/incidents/{id}`),
          ]);

        const workflowData = await workflowRes.json();
        const incidentData = await incidentRes.json();

        setWorkflow(workflowData.workflow);
        setIncidents(incidentData.incidents ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      load();
    }
  }, [id]);

  if (loading) {
    return (
      <main className="p-8 text-inactive">
        Loading assistant...
      </main>
    );
  }

  if (!workflow) {
    return (
      <main className="p-8">
        <h1 className="text-xl text-white">
          Assistant not found
        </h1>
      </main>
    );
  }

  return (
    <main className="p-8 space-y-8">

      <div>
        <h1 className="text-3xl font-bold text-white">
          {workflow.name}
        </h1>

        <p className="text-inactive mt-2">
          Platform: {workflow.platform}
        </p>
      </div>

      <section className="rounded-lg border border-default bg-surface-2 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Workflow Status
        </h2>

        <div className="space-y-2">
          <p className="text-white">
            Status: {workflow.status}
          </p>

          <p className="text-inactive">
            Last Snapshot:{" "}
            {workflow.last_snapshot_at
              ? new Date(
                  workflow.last_snapshot_at
                ).toLocaleString()
              : "Never"}
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-default bg-surface-2 p-6">

        <h2 className="text-lg font-semibold text-white mb-4">
          Open Incidents
        </h2>

        {incidents.length === 0 ? (
          <p className="text-inactive">
            No incidents found.
          </p>
        ) : (
          <div className="space-y-4">
            {incidents.map((incident) => (
              <div
                key={incident.id}
                className="rounded-md border border-status-error p-4"
              >
                <p className="text-status-error font-medium">
                  {incident.error_message}
                </p>

                <p className="text-sm text-inactive mt-2">
                  {new Date(
                    incident.detected_at
                  ).toLocaleString()}
                </p>

                {incident.root_cause && (
                  <div className="mt-4">
                    <p className="text-white font-medium">
                      Root Cause
                    </p>

                    <p className="text-inactive">
                      {incident.root_cause}
                    </p>
                  </div>
                )}

                {incident.confidence && (
                  <p className="mt-3 text-sm text-brand-blue">
                    Confidence:{" "}
                    {(incident.confidence * 100).toFixed(0)}%
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

    </main>
  );
}