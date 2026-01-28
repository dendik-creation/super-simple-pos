import { Customer } from "./customer";
import { Debt } from "./debt";
import { Product } from "./product";

export type Transaction = {
    id: number;
    invoice_code: string;
    customer_id: number;
    subtotal: number;
    discount: number;
    total: number;
    paid_amount: number;
    change_amount: number;
    payment_status: "" | "paid" | "debt";
    transaction_time: string;
    customer: Customer;
    debt: Debt;
    items: TransactionItem[];
};

export type TransactionItem = {
    id: number;
    transaction_id: number;
    product_id: number;
    quantity: number;
    cost_price: number;
    unit_price: number;
    total_price: number;
    product: Product;
};
