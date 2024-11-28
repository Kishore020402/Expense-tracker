import { useMemo } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
	Member,
	Expense,
	Settlement,
	Currency,
	CURRENCY_SYMBOLS,
	EXCHANGE_RATES,
} from "./lib/types";

// Settlement Calculator Component
interface SettlementCalculatorProps {
	expenses: Expense[];
	members: Member[];
}

export const SettlementCalculator: React.FC<SettlementCalculatorProps> = ({
	expenses,
	members,
}) => {
	const settlements = useMemo(() => {
		// Convert all amounts to USD for calculations
		const balances = members.reduce((acc, member) => {
			acc[member.id] = 0;
			return acc;
		}, {} as Record<string, number>);

		// Calculate net balance for each member
		expenses.forEach((expense) => {
			const amount = expense.amount / EXCHANGE_RATES[expense.currency];
			const paidBy = expense.paidBy;
			const splitWith =
				expense.splitWith.length > 0
					? expense.splitWith
					: members.map((m) => m.id);
			const shareAmount = amount / splitWith.length;

			balances[paidBy] += amount; // Add full amount to payer
			splitWith.forEach((memberId) => {
				balances[memberId] -= shareAmount; // Subtract share from each member
			});
		});

		// Calculate settlements
		const settlements: Settlement[] = [];
		const debtors = Object.entries(balances)
			.filter(([_, balance]) => balance < 0)
			.sort(([, a], [, b]) => a - b);
		const creditors = Object.entries(balances)
			.filter(([_, balance]) => balance > 0)
			.sort(([, a], [, b]) => b - a);

		while (debtors.length > 0 && creditors.length > 0) {
			const [debtorId, debtorBalance] = debtors[0];
			const [creditorId, creditorBalance] = creditors[0];

			const amount = Math.min(Math.abs(debtorBalance), creditorBalance);

			if (amount > 0.01) {
				// Only create settlement if amount is significant
				settlements.push({
					from: debtorId,
					to: creditorId,
					amount: Number(amount.toFixed(2)),
					currency: "USD" as Currency,
				});
			}

			// Update balances
			if (Math.abs(debtorBalance) < creditorBalance) {
				creditors[0][1] -= Math.abs(debtorBalance);
				debtors.shift();
			} else {
				debtors[0][1] += creditorBalance;
				creditors.shift();
			}
		}

		return settlements;
	}, [expenses, members]);

	const getMemberName = (id: string) => {
		return members.find((m) => m.id === id)?.name || "Unknown";
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Settlement Summary</CardTitle>
				<CardDescription>How to settle up the group</CardDescription>
			</CardHeader>
			<CardContent>
				{settlements.length === 0 ? (
					<div className="text-center text-gray-500 py-8">
						No settlements needed - everyone is even!
					</div>
				) : (
					<div className="space-y-4">
						{settlements.map((settlement, index) => (
							<div
								key={index}
								className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
							>
								<div className="flex items-center gap-2">
									<span className="font-medium">
										{getMemberName(settlement.from)}
									</span>
									<span className="text-gray-500">pays</span>
									<span className="font-medium">
										{getMemberName(settlement.to)}
									</span>
								</div>
								<Badge variant="secondary" className="text-lg">
									{CURRENCY_SYMBOLS[settlement.currency]}
									{settlement.amount.toFixed(2)}
								</Badge>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
};
