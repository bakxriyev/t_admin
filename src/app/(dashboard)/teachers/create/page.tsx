"use client";

import { EntityForm } from "@/components/shared/EntityForm";
import { teacherSchema } from "@/lib/validations";

const fields = [
  { name: "first_name", label: "Ism", type: "multilang" as const, placeholder: "Ism" },
  { name: "last_name", label: "Familiya", type: "multilang" as const, placeholder: "Familiya" },
  { name: "patronymic", label: "Otasining ismi", type: "multilang" as const, placeholder: "Otasining ismi", required: false },
  { name: "position", label: "Lavozim", type: "multilang" as const, placeholder: "Lavozim" },
  { name: "order", label: "Tartib", type: "number" as const },
  { name: "photo", label: "Rasm", type: "file" as const },
  { name: "is_active", label: "Faol", type: "boolean" as const },
];

export default function CreateTeacherPage() {
  return (
    <EntityForm
      schema={teacherSchema}
      apiEndpoint="/api/teachers"
      redirectPath="/teachers"
      title="Yangi o'qituvchi"
      editTitle="O'qituvchini tahrirlash"
      fields={fields}
    />
  );
}
