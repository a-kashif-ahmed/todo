import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/auth-helper";
import { getN8nWorkflows } from "@/lib/connections/n8n";

export async function POST() {

    const ctx = await getAuthContext();

    if (ctx.error) return ctx.error;

    const { db } = ctx;

    const { data: integrations, error } = await db
        .from("flowlens_platforms")
        .select("*")
        .eq("status", "connected");

    if (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }

    let imported = 0;

    for (const integration of integrations) {

        if (integration.platform !== "n8n")
            continue;

        try {

            const workflows =
                await getN8nWorkflows(
                    integration.base_url,
                    integration.api_key
                );

            for (const workflow of workflows) {

                await db
                    .from("flowlens_workflows")
                    .upsert(
                        {
                            team_id: integration.team_id,

                            external_id: workflow.id,

                            platform: "n8n",

                            name: workflow.name,

                            status: workflow.active
                                ? "healthy"
                                : "disabled",

                            updated_at: new Date()
                        },
                        {
                            onConflict: "external_id"
                        }
                    );

                imported++;

            }

            await db
                .from("flowlens_platforms")
                .update({
                    last_sync: new Date(),
                    status: "connected"
                })
                .eq("id", integration.id);

        }
        catch {

            await db
                .from("flowlens_platforms")
                .update({
                    status: "error"
                })
                .eq("id", integration.id);

        }

    }

    return NextResponse.json({
        success: true,
        imported
    });

}