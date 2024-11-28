// types.ts
export interface Member {
	id: string;
	name: string;
	email?: string;
}

export interface Expense {
	id: string;
	description: string;
	amount: number;
	paidBy: string;
	date: string;
	category: string;
	currency: Currency;
	splitWith: string[];
}

export interface Settlement {
	from: string;
	to: string;
	amount: number;
	currency: Currency;
}

export const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
	USD: "$",
	EUR: "€",
	GBP: "£",
	JPY: "¥",
	AUD: "$",
	CAD: "$",
};

export const EXCHANGE_RATES: Record<Currency, number> = {
	USD: 1,
	EUR: 0.91,
	GBP: 0.79,
	JPY: 150.27,
	AUD: 1.52,
	CAD: 1.35,
};
