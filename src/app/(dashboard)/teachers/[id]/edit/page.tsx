"use client";

import { EntityForm } from "@/components/shared/EntityForm";
import { teacherSchema } from "@/lib/validations";

const fields = [
  { name: "first_name", label: "Ism", type: "multilang" as const, placeholder: "Ism" },
  { name: "last_name", label: "Familiya", type: "multilang" as const, placeholder: "Familiya" },
  { name: "patronymic", label: "Otasining ismi", type: "multilang" as const, placeholder: "Otasining ismi" },
  { name: "position", label: "Lavozim", type: "multilang" as const, placeholder: "Lavozim" },
  { name: "bio", label: "Biografiya", type: "multilang-textarea" as const, placeholder: "Biografiya" },
  { name: "degree", label: "Daraja", type: "multilang" as const, placeholder: "Daraja" },
  { name: "email", label: "Email", type: "email" as const, placeholder: "email@example.com" },
  { name: "phone", label: "Telefon", type: "text" as const, placeholder: "+998901234567" },
  { name: "order", label: "Tartib", type: "number" as const },
  { name: "photo", label: "Rasm", type: "file" as const },
  { name: "is_active", label: "Faol", type: "boolean" as const },
];

export default function EditTeacherPage() {
  return (
    <EntityForm
      schema={teacherSchema}
      apiEndpoint="/api/teachers"
      redirectPath="/teachers"
      title="Yangi o'qituvchi"
      editTitle="O'qituvchini tahrirlash"
      fields={fields}
      isEdit
    />
  );
}
