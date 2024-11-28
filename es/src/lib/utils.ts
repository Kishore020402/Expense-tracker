import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Currency, EXCHANGE_RATES, Expense, Settlement, Member } from "./types";

// Styling utility
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Currency conversion with proper type safety and rounding
export const convertCurrency = (
	amount: number,
	fromCurrency: Currency,
	toCurrency: Currency
): number => {
	const inUSD = amount / EXCHANGE_RATES[fromCurrency];
	const converted = inUSD * EXCHANGE_RATES[toCurrency];
	return Number(converted.toFixed(2));
};

// Calculate total expenses for a member
export const calculateMemberTotal = (
	expenses: Expense[],
	memberId: string,
	targetCurrency: Currency = "USD"
): number => {
	return Number(
		expenses
			.reduce((total, expense) => {
				const amountInTargetCurrency = convertCurrency(
					expense.amount,
					expense.currency,
					targetCurrency
				);
				if (expense.paidBy === memberId) {
					return total + amountInTargetCurrency;
				}
				const isInvolved = expense.splitWith.includes(memberId);
				if (isInvolved) {
					return total - amountInTargetCurrency / expense.splitWith.length;
				}
				return total;
			}, 0)
			.toFixed(2)
	);
};

// Calculate expense statistics
export const calculateExpenseStats = (
	expenses: Expense[],
	targetCurrency: Currency = "USD"
) => {
	const stats = expenses.reduce(
		(acc, expense) => {
			const amountInTargetCurrency = convertCurrency(
				expense.amount,
				expense.currency,
				targetCurrency
			);

			// Update total
			acc.total += amountInTargetCurrency;

			// Update category totals
			acc.byCategory[expense.category] =
				(acc.byCategory[expense.category] || 0) + amountInTargetCurrency;

			// Track min/max amounts
			if (amountInTargetCurrency > acc.maxAmount) {
				acc.maxAmount = amountInTargetCurrency;
				acc.maxExpense = expense;
			}
			if (amountInTargetCurrency < acc.minAmount) {
				acc.minAmount = amountInTargetCurrency;
				acc.minExpense = expense;
			}

			return acc;
		},
		{
			total: 0,
			byCategory: {} as Record<string, number>,
			maxAmount: -Infinity,
			minAmount: Infinity,
			maxExpense: null as Expense | null,
			minExpense: null as Expense | null,
		}
	);

	return {
		...stats,
		average: Number((stats.total / expenses.length || 0).toFixed(2)),
		categorySummary: Object.entries(stats.byCategory).map(
			([category, amount]) => ({
				category,
				amount: Number(amount.toFixed(2)),
				percentage: Number(((amount / stats.total) * 100).toFixed(1)),
			})
		),
	};
};

// Enhanced settlement calculation with split handling
export const calculateSettlements = (
	expenses: Expense[],
	members: Member[]
): Settlement[] => {
	// Initialize balances for all members
	const balances: Record<string, number> = {};
	members.forEach((member) => {
		balances[member.id] = 0;
	});

	// Calculate net balances considering split arrangements
	expenses.forEach((expense) => {
		const amountInUSD = convertCurrency(
			expense.amount,
			expense.currency,
			"USD"
		);

		// Add full amount to payer's balance
		balances[expense.paidBy] += amountInUSD;

		// Calculate and subtract shares from split participants
		const splitParticipants =
			expense.splitWith.length > 0
				? expense.splitWith
				: members.map((m) => m.id);
		const shareAmount = amountInUSD / splitParticipants.length;

		splitParticipants.forEach((memberId) => {
			balances[memberId] -= shareAmount;
		});
	});

	// Calculate optimal settlements
	const settlements: Settlement[] = [];
	const debtors = Object.entries(balances)
		.filter(([_, balance]) => balance < -0.01) // Using small threshold to handle floating point
		.sort(([, a], [, b]) => a - b);
	const creditors = Object.entries(balances)
		.filter(([_, balance]) => balance > 0.01)
		.sort(([, a], [, b]) => b - a);

	let debtorIdx = 0;
	let creditorIdx = 0;

	while (debtorIdx < debtors.length && creditorIdx < creditors.length) {
		const [debtorId, debtorBalance] = debtors[debtorIdx];
		const [creditorId, creditorBalance] = creditors[creditorIdx];

		const settleAmount = Math.min(Math.abs(debtorBalance), creditorBalance);

		if (settleAmount >= 0.01) {
			settlements.push({
				from: debtorId,
				to: creditorId,
				amount: Number(settleAmount.toFixed(2)),
				currency: "USD",
			});
		}

		// Update balances and move indices
		if (Math.abs(debtorBalance) - settleAmount < 0.01) {
			debtorIdx++;
		}
		if (creditorBalance - settleAmount < 0.01) {
			creditorIdx++;
		}

		if (debtorIdx < debtors.length) {
			debtors[debtorIdx][1] = Number(
				(debtors[debtorIdx][1] + settleAmount).toFixed(2)
			);
		}
		if (creditorIdx < creditors.length) {
			creditors[creditorIdx][1] = Number(
				(creditors[creditorIdx][1] - settleAmount).toFixed(2)
			);
		}
	}

	return settlements;
};

// Helper functions for formatting and validation
export const formatCurrency = (amount: number, currency: Currency): string => {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(amount);
};

export const formatDate = (date: string): string => {
	return new Date(date).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
};

export const validateExpense = (expense: Partial<Expense>): string[] => {
	const errors: string[] = [];

	if (!expense.description?.trim()) {
		errors.push("Description is required");
	}

	if (!expense.amount || expense.amount <= 0) {
		errors.push("Amount must be greater than 0");
	}

	if (!expense.paidBy) {
		errors.push("Paid by member must be selected");
	}

	if (!expense.date) {
		errors.push("Date is required");
	}

	if (!expense.category?.trim()) {
		errors.push("Category is required");
	}

	return errors;
};

// Group expenses by various criteria
export const groupExpenses = (
	expenses: Expense[],
	groupBy: "date" | "category" | "paidBy"
): Record<string, Expense[]> => {
	return expenses.reduce((groups, expense) => {
		const key =
			groupBy === "date" ? expense.date.split("T")[0] : expense[groupBy];

		if (!groups[key]) {
			groups[key] = [];
		}
		groups[key].push(expense);
		return groups;
	}, {} as Record<string, Expense[]>);
};
