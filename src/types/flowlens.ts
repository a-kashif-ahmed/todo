export interface FlowNode {
    id:string,
    type: string,
    label: string,
    config: Record<string, unknown>;
    credential_ref?: string;
    position?: {x:number, y:number};
}

export interface FlowEdge {
    id:string,
    source:string;
    target:string;
    label?: string;
}

export interface NormalisedWorkFlow {
    nodes: FlowNode[];
    edges: FlowEdge[];
    meta : {
        platform: "n8n" | "zapier" | "make" | "manual" ;
        name: string;
        version?: string;
    };

}

export type DiffStatus = "added" | "removed" | "modified" | "unchanged";

export interface NodeDiff {
    nodeId : string;
    nodeLabel: string;
    status: DiffStatus;
    changedFields? : Array<{field:string; before: unknown; after: unknown;}>;
}

export interface WorkflowDiff {
    nodes:NodeDiff[];
    edgesChanged: boolean;
    summary: {added:number, removed:number, modified:number};
}