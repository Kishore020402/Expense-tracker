import React from "react";
import { Edit2, Trash2, Calendar } from "lucide-react";
import {
	Card,
	CardHeader,
	CardContent,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Member, Expense, CURRENCY_SYMBOLS } from "./lib/types";

interface ExpenseListProps {
	expenses: Expense[];
	members: Member[];
	onEditExpense: (expense: Expense) => void;
	onDeleteExpense: (id: string) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
	expenses,
	members,
	onEditExpense,
	onDeleteExpense,
}) => {
	const getMemberName = (id: string) => {
		const member = members.find((m) => m.id === id);
		return member ? member.name : "Unknown";
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	return (
		<Card className="mb-6">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Calendar size={20} />
					Expense History
				</CardTitle>
			</CardHeader>
			<CardContent>
				{expenses.length === 0 ? (
					<div className="text-center text-gray-500 py-8">
						No expenses added yet
					</div>
				) : (
					<div className="space-y-4">
						{expenses.map((expense) => (
							<Card
								key={expense.id}
								className="relative hover:shadow-md transition-shadow"
							>
								<CardHeader className="py-4">
									<div className="flex justify-between items-start">
										<div>
											<CardTitle className="text-lg">
												{expense.description}
											</CardTitle>
											<CardDescription>
												Paid by {getMemberName(expense.paidBy)} •{" "}
												{expense.category} • {formatDate(expense.date)}
											</CardDescription>
											<div className="mt-2 text-sm">
												Split with:{" "}
												{expense.splitWith
													.map((id) => getMemberName(id))
													.join(", ")}
											</div>
										</div>
										<div className="flex items-center gap-2">
											<Badge variant="secondary" className="text-lg">
												{CURRENCY_SYMBOLS[expense.currency]}
												{expense.amount.toFixed(2)}
											</Badge>
											<div className="flex gap-1">
												<Button
													variant="ghost"
													size="icon"
													onClick={() => onEditExpense(expense)}
													className="hover:text-blue-500"
												>
													<Edit2 className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													onClick={() => onDeleteExpense(expense.id)}
													className="hover:text-red-500"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</div>
									</div>
								</CardHeader>
							</Card>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
};
