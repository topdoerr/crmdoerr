import prisma from "@/lib/prisma";
import { CustomFieldInput } from "./custom-field-input";

interface CustomFieldsDisplayProps {
  relType: string;
  relId: number;
}

export async function CustomFieldsDisplay({ relType, relId }: CustomFieldsDisplayProps) {
  const fields = await prisma.customField.findMany({
    where: { fieldTo: relType, active: 1 },
    orderBy: { displayOrder: "asc" },
  });

  if (fields.length === 0) return null;

  const values = await prisma.customFieldValue.findMany({
    where: { relId, fieldTo: relType, fieldId: { in: fields.map((f) => f.id) } },
  });

  const valueMap: Record<number, string> = {};
  values.forEach((v) => {
    valueMap[v.fieldId] = v.value;
  });

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm">Custom Fields</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => (
          <CustomFieldInput
            key={field.id}
            field={{
              id: field.id,
              name: field.name,
              fieldType: field.fieldType,
              options: field.options,
              required: field.required,
            }}
            relType={relType}
            relId={relId}
            initialValue={valueMap[field.id] ?? ""}
          />
        ))}
      </div>
    </div>
  );
}
