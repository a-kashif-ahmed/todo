"use client";

import { useState } from "react";
import ConnectionCard from "@/components/connections/ConnectionCard";
import ConnectionModal from "@/components/connections/ConnectionModal";

export default function ConnectionsPage() {

  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [open, setOpen] = useState(false);

  const integrations = [
    {
      platform: "n8n",
      description: "Connect self hosted or cloud n8n.",
      connected: false
    },
    {
      platform: "Zapier",
      description: "Import your Zaps.",
      connected: false
    },
    {
      platform: "Make",
      description: "Sync Make scenarios.",
      connected: false
    }
  ];

  return (

    <div className="p-8">

      <h1 className="text-3xl text-text-primary font-semibold mb-8">
        Integrations
      </h1>

      <div className="grid md:grid-cols-3 gap-6">

        {integrations.map(i => (

          <ConnectionCard

            key={i.platform}

            platform={i.platform}

            description={i.description}

            connected={i.connected}

            lastSync="5 minutes ago"

            onConnect={() => {
              setSelectedPlatform(i.platform);
              setOpen(true);
            }}

          />

        ))}

      </div>

      <ConnectionModal

        platform={selectedPlatform}

        open={open}

        onClose={() => setOpen(false)}

      />

    </div>

  );
}