"use client";

import { useActionState, useTransition } from "react";
import { ORDER_STATUS, type OrderStatus } from "@/app/lib/types";
import { deleteOrder, updateOrder } from "../../../actions";
import { Card, Label, Notice, btnDanger, btnPrimary, input } from "../../../ui";

export default function OrderControls({ id, status, adminNotes }: { id: string; status: OrderStatus; adminNotes: string }) {
  const [state, action, pending] = useActionState(updateOrder, null);
  const [deleting, startDelete] = useTransition();

  return (
    <>
      <Card title="Andamento">
        <form action={action} className="space-y-4">
          <input type="hidden" name="id" value={id} />
          <Label text="Status">
            <select name="status" defaultValue={status} className={input}>
              {Object.entries(ORDER_STATUS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </Label>
          <Label text="Anotações internas" hint="Só aparecem aqui no painel.">
            <textarea name="admin_notes" rows={4} defaultValue={adminNotes} className={input} />
          </Label>
          <Notice result={state} />
          <button type="submit" disabled={pending} className={`${btnPrimary} w-full`}>
            {pending ? "Salvando..." : "Salvar"}
          </button>
        </form>
      </Card>
      <button
        type="button"
        disabled={deleting}
        onClick={() => {
          if (confirm("Excluir este pedido? Essa ação não pode ser desfeita.")) startDelete(() => deleteOrder(id));
        }}
        className={`${btnDanger} w-full`}
      >
        {deleting ? "Excluindo..." : "Excluir pedido"}
      </button>
    </>
  );
}
