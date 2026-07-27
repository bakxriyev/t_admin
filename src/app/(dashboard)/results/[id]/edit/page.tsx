"use client";

import { EntityForm } from "@/components/shared/EntityForm";
import { resultSchema } from "@/lib/validations";

const fields = [
  { name: "student_name", label: "Talaba ismi", type: "multilang" as const, placeholder: "Ism" },
  { name: "achievement", label: "Yutuq", type: "multilang" as const, placeholder: "Yutuq" },
  { name: "description", label: "Tavsif", type: "multilang-textarea" as const, placeholder: "Tavsif" },
  { name: "year", label: "Yil", type: "number" as const },
  { name: "photos", label: "Rasmlar", type: "multi-file" as const },
  { name: "is_active", label: "Faol", type: "boolean" as const },
];

export default function EditResultPage() {
  return (
    <EntityForm
      schema={resultSchema}
      apiEndpoint="/api/results"
      redirectPath="/results"
      title="Yangi natija"
      editTitle="Natijani tahrirlash"
      fields={fields}
      isEdit
    />
  );
}
