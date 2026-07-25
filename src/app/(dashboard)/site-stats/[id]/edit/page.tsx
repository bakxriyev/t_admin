"use client";

import { EntityForm } from "@/components/shared/EntityForm";
import { statisticSchema } from "@/lib/validations";

const fields = [
  { name: "label", label: "Nomi", type: "multilang" as const, placeholder: "Talabalar" },
  { name: "value", label: "Qiymat (son)", type: "number" as const, placeholder: "1500" },
  { name: "suffix", label: "Qo'shimcha (+, %, x)", type: "text" as const, placeholder: "+" },
  { name: "icon", label: "Ikonka (lucide)", type: "text" as const, placeholder: "Users" },
  { name: "order", label: "Tartib", type: "number" as const },
  { name: "is_active", label: "Faol", type: "boolean" as const },
];

export default function EditSiteStatPage() {
  return (
    <EntityForm
      schema={statisticSchema}
      apiEndpoint="/api/statistics"
      redirectPath="/site-stats"
      title="Yangi statistika"
      editTitle="Statistikani tahrirlash"
      fields={fields}
      isEdit
    />
  );
}
