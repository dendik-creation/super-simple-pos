import { Customer } from "./customer";
import { Transaction } from "./transaction";

export type Debt = {
    id: number;
    customer_id: number;
    debt_amount: number;
    remaining_debt_amount: number;
    debt_time: string;
    transaction_id: number;
    debt_payments: DebtPayment[];
    customer: Customer;
    transaction: Transaction;
};

export type DebtPayment = {
    id: number;
    debt_id: number;
    paid_amount: number;
    payment_date: string;
};
