export const transactionTypeOptions = {
  transfer: 'transfer',
  deposit: 'deposit',
  withdrawal: 'withdrawal',
};

export type TransactionType =
  (typeof transactionTypeOptions)[keyof typeof transactionTypeOptions];
