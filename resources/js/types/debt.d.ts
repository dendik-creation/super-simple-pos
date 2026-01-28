export type Debt = {
    id: number;
    customer_id: number;
    debt_amount: number;
    remaining_debt_amount: number;
    debt_time: string;
    transaction_id: number;
    debt_payments: DebtPayment[];
};

export type DebtPayment = {
    id: number;
    debt_id: number;
    paid_amount: number;
    payment_time: string;
};
