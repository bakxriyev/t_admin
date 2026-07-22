"use client";

import { EntityForm } from "@/components/shared/EntityForm";
import { z } from "zod";

const socialLinkSchema = z.object({
  platform: z.string().min(1),
  url: z.string().min(1),
  order: z.number().optional(),
});

const fields = [
  { name: "platform", label: "Platforma", type: "text" as const, placeholder: "Instagram, Facebook, Telegram..." },
  { name: "url", label: "URL", type: "url" as const, placeholder: "https://..." },
  { name: "order", label: "Tartib", type: "number" as const },
];

export default function CreateSocialLinkPage() {
  return (
    <EntityForm
      schema={socialLinkSchema}
      apiEndpoint="/api/social-links"
      redirectPath="/social-links"
      title="Yangi havola"
      editTitle="Havolani tahrirlash"
      fields={fields}
    />
  );
}
