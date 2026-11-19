"use client";

import { EntityForm } from "@/components/shared/EntityForm";
import { teamMemberSchema } from "@/lib/validations";

const fields = [
  { name: "first_name", label: "Ism", type: "multilang" as const, placeholder: "Ism" },
  { name: "last_name", label: "Familiya", type: "multilang" as const, placeholder: "Familiya" },
  { name: "position", label: "Lavozim", type: "multilang" as const, placeholder: "Lavozim" },
  { name: "photo", label: "Rasm", type: "file" as const },
  { name: "order", label: "Tartib", type: "number" as const },
  { name: "is_active", label: "Faol", type: "boolean" as const },
];

export default function CreateTeamMemberPage() {
  return (
    <EntityForm
      schema={teamMemberSchema}
      apiEndpoint="/api/team"
      redirectPath="/team"
      title="Yangi a'zo"
      editTitle="A'zoni tahrirlash"
      fields={fields}
    />
  );
}
