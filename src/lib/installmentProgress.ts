export interface InstallmentTransactionRow {
  id: string;
  name: string;
  category: string;
  amount: number;
  installment_current: number | null;
  installments: number | null;
  payment_method: string;
  date: string;
  credit_card_id: string | null;
  parent_transaction_id: string | null;
  status: string;
  type?: string | null;
}

interface InvoiceRow {
  is_paid: boolean;
}

interface InvoiceTransactionRow {
  id: string;
  name: string;
  category: string;
  payment_method: string;
  credit_card_id: string | null;
  parent_transaction_id: string | null;
  date: string;
  type?: string | null;
}

export interface InstallmentInvoiceRow {
  transaction_id: string;
  amount: number;
  installment_number: number;
  total_installments: number;
  invoices: InvoiceRow | InvoiceRow[] | null;
  transactions: InvoiceTransactionRow | InvoiceTransactionRow[] | null;
}

export interface ActiveInstallmentItem {
  id: string;
  name: string;
  category: string;
  amount: number;
  installment_current: number;
  installments: number;
  payment_method: string;
  date: string;
  credit_card_id: string | null;
}

interface InstallmentGroup {
  id: string;
  name: string;
  category: string;
  amount: number;
  installments: number;
  payment_method: string;
  date: string;
  credit_card_id: string | null;
  paidInstallments: Set<number>;
}

const pickOne = <T,>(value: T | T[] | null | undefined): T | null => {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
};

const getConsecutivePaidInstallments = (paidInstallments: Set<number>, totalInstallments: number) => {
  let count = 0;
  for (let installment = 1; installment <= totalInstallments; installment += 1) {
    if (!paidInstallments.has(installment)) break;
    count = installment;
  }
  return count;
};

const upsertGroup = (map: Map<string, InstallmentGroup>, group: Omit<InstallmentGroup, "paidInstallments">) => {
  const existing = map.get(group.id);

  if (existing) {
    existing.installments = Math.max(existing.installments, group.installments);
    if (group.date < existing.date) existing.date = group.date;
    return existing;
  }

  const created: InstallmentGroup = {
    ...group,
    paidInstallments: new Set<number>(),
  };
  map.set(group.id, created);
  return created;
};

export const buildActiveInstallmentItems = ({
  transactions,
  invoiceItems,
}: {
  transactions: InstallmentTransactionRow[];
  invoiceItems: InstallmentInvoiceRow[];
}): ActiveInstallmentItem[] => {
  const groups = new Map<string, InstallmentGroup>();

  transactions.forEach((tx) => {
    if (tx.type && tx.type !== "despesa") return;
    if (!tx.installments || tx.installments <= 1) return;
    if (tx.payment_method === "cartao" && tx.credit_card_id) return;

    const installmentNumber = tx.installment_current ?? 1;
    const groupId = tx.parent_transaction_id ?? tx.id;
    const group = upsertGroup(groups, {
      id: groupId,
      name: tx.name,
      category: tx.category,
      amount: tx.amount,
      installments: tx.installments,
      payment_method: tx.payment_method,
      date: tx.date,
      credit_card_id: tx.credit_card_id,
    });

    if (tx.status === "pago") {
      group.paidInstallments.add(installmentNumber);
    }
  });

  invoiceItems.forEach((item) => {
    const tx = pickOne(item.transactions);
    const invoice = pickOne(item.invoices);

    if (!tx || !invoice) return;
    if (tx.type && tx.type !== "despesa") return;
    if (item.total_installments <= 1) return;

    const groupId = tx.parent_transaction_id ?? item.transaction_id;
    const group = upsertGroup(groups, {
      id: groupId,
      name: tx.name,
      category: tx.category,
      amount: item.amount,
      installments: item.total_installments,
      payment_method: tx.payment_method,
      date: tx.date,
      credit_card_id: tx.credit_card_id,
    });

    if (invoice.is_paid) {
      group.paidInstallments.add(item.installment_number);
    }
  });

  return Array.from(groups.values())
    .map((group) => {
      const paidInstallments = getConsecutivePaidInstallments(group.paidInstallments, group.installments);
      if (paidInstallments >= group.installments) return null;

      return {
        id: group.id,
        name: group.name,
        category: group.category,
        amount: group.amount,
        installment_current: paidInstallments + 1,
        installments: group.installments,
        payment_method: group.payment_method,
        date: group.date,
        credit_card_id: group.credit_card_id,
      } satisfies ActiveInstallmentItem;
    })
    .filter((item): item is ActiveInstallmentItem => item !== null)
    .sort((a, b) => b.amount - a.amount);
};