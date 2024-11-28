import React, { useMemo } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	Cell,
} from "recharts";
import {
	Member,
	Expense,
	Settlement,
	Currency,
	CURRENCY_SYMBOLS,
	EXCHANGE_RATES,
} from "./lib/types";

// Analytics Component
interface AnalyticsProps {
	expenses: Expense[];
	members: Member[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ expenses, members }) => {
	const analytics = useMemo(() => {
		const categoryTotals = expenses.reduce((acc, expense) => {
			const amount = expense.amount / EXCHANGE_RATES[expense.currency];
			acc[expense.category] = (acc[expense.category] || 0) + amount;
			return acc;
		}, {} as Record<string, number>);

		const memberTotals = expenses.reduce((acc, expense) => {
			const amount = expense.amount / EXCHANGE_RATES[expense.currency];
			acc[expense.paidBy] = (acc[expense.paidBy] || 0) + amount;
			return acc;
		}, {} as Record<string, number>);

		const chartData = {
			categories: Object.entries(categoryTotals).map(([name, value]) => ({
				name,
				value: Number(value.toFixed(2)),
			})),
			members: Object.entries(memberTotals).map(([id, value]) => ({
				name: members.find((m) => m.id === id)?.name || "Unknown",
				value: Number(value.toFixed(2)),
			})),
		};

		const totalExpenses = expenses.reduce(
			(sum, expense) => sum + expense.amount / EXCHANGE_RATES[expense.currency],
			0
		);

		return {
			chartData,
			totalExpenses: Number(totalExpenses.toFixed(2)),
			averageExpense: Number((totalExpenses / expenses.length || 0).toFixed(2)),
		};
	}, [expenses, members]);

	const colors = ["#60a5fa", "#34d399", "#f87171", "#a78bfa", "#fbbf24"];

	return (
		<Card className="mb-6">
			<CardHeader>
				<CardTitle>Expense Analytics</CardTitle>
				<CardDescription>Overview of group expenses</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4 md:grid-cols-2">
					<div>
						<h4 className="font-semibold mb-2">Summary</h4>
						<div className="space-y-2">
							<div className="flex justify-between items-center">
								<span>Total Expenses:</span>
								<Badge variant="secondary">${analytics.totalExpenses}</Badge>
							</div>
							<div className="flex justify-between items-center">
								<span>Average per Expense:</span>
								<Badge variant="secondary">${analytics.averageExpense}</Badge>
							</div>
						</div>
					</div>

					<div className="h-64">
						<h4 className="font-semibold mb-2">Expenses by Category</h4>
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={analytics.chartData.categories}>
								<XAxis dataKey="name" />
								<YAxis />
								<Tooltip />
								<Bar dataKey="value">
									{analytics.chartData.categories.map((_, index) => (
										<Cell
											key={`cell-${index}`}
											fill={colors[index % colors.length]}
										/>
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</div>

					<div className="h-64 md:col-span-2">
						<h4 className="font-semibold mb-2">Expenses by Member</h4>
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={analytics.chartData.members}>
								<XAxis dataKey="name" />
								<YAxis />
								<Tooltip />
								<Bar dataKey="value">
									{analytics.chartData.members.map((_, index) => (
										<Cell
											key={`cell-${index}`}
											fill={colors[index % colors.length]}
										/>
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};
