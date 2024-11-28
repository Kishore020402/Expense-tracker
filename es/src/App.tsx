import React, { useState, useEffect } from "react";
import { Member, Expense } from "./lib/types";
import MemberManagement from "./MemberManagement";
import ExpenseForm from "./ExpenseForm";
import { ExpenseList } from "./ExpenseList";
import { SettlementCalculator } from "./SettlementCalculator";
import { Analytics } from "./Analytics";
import { Section } from "lucide-react";

const LOCAL_STORAGE_KEYS = {
	MEMBERS: "expense-splitter-members",
	EXPENSES: "expense-splitter-expenses",
};

export default function App() {
	// Initialize state with localStorage data
	const [members, setMembers] = useState<Member[]>(() => {
		const savedMembers = localStorage.getItem(LOCAL_STORAGE_KEYS.MEMBERS);
		return savedMembers ? JSON.parse(savedMembers) : [];
	});

	const [expenses, setExpenses] = useState<Expense[]>(() => {
		const savedExpenses = localStorage.getItem(LOCAL_STORAGE_KEYS.EXPENSES);
		return savedExpenses ? JSON.parse(savedExpenses) : [];
	});

	const [editingExpense, setEditingExpense] = useState<Expense | undefined>(
		undefined
	);
	const isEditing = !!editingExpense;

	// Persist data to localStorage
	useEffect(() => {
		localStorage.setItem(LOCAL_STORAGE_KEYS.MEMBERS, JSON.stringify(members));
	}, [members]);

	useEffect(() => {
		localStorage.setItem(LOCAL_STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
	}, [expenses]);

	// Member management
	const handleAddMember = (member: Member) => {
		setMembers((prev) => [...prev, member]);
	};

	const handleRemoveMember = (id: string) => {
		// Check if member has any expenses
		const hasExpenses = expenses.some(
			(expense) => expense.paidBy === id || expense.splitWith.includes(id)
		);

		if (hasExpenses) {
			alert("Cannot remove member with existing expenses");
			return;
		}

		setMembers((prev) => prev.filter((member) => member.id !== id));
	};

	// Expense management
	const handleAddExpense = (expense: Expense) => {
		// Validate expense before adding
		if (
			!expense.description ||
			!expense.amount ||
			!expense.paidBy ||
			!expense.category ||
			!expense.currency ||
			expense.splitWith.length === 0
		) {
			alert("Please fill in all fields.");
			return;
		}

		setExpenses((prev) => [...prev, expense]);
	};

	const handleUpdateExpense = (updatedExpense: Expense) => {
		setExpenses((prev) =>
			prev.map((expense) =>
				expense.id === updatedExpense.id ? updatedExpense : expense
			)
		);
		setEditingExpense(undefined);
	};

	const handleDeleteExpense = (id: string) => {
		if (window.confirm("Are you sure you want to delete this expense?")) {
			setExpenses((prev) => prev.filter((expense) => expense.id !== id));
		}
	};

	const handleExpenseChange = (
		field: keyof Expense,
		value: string | number | string[]
	) => {
		setEditingExpense((prev) => {
			if (!prev) return undefined;
			return { ...prev, [field]: value };
		});
	};

	const handleReset = () => {
		setEditingExpense(undefined);
	};

	return (
		<section className="flex flex-col min-h-screen bg-blue-400">
			<div className="min-h-screen bg-gray-50 p-4 md:p-8">
				<div className="max-w-4xl mx-auto space-y-6">
					<h1 className="text-3xl font-bold mb-8 text-center">
						Expense Splitter
					</h1>

					<MemberManagement
						members={members}
						onAddMember={handleAddMember}
						onRemoveMember={handleRemoveMember}
					/>

					<ExpenseForm
						expense={editingExpense || {}}
						members={members}
						onSubmit={isEditing ? handleUpdateExpense : handleAddExpense}
						onChange={handleExpenseChange}
						onReset={handleReset}
						isEditing={isEditing}
					/>

					{members.length > 0 && (
						<>
							<Analytics expenses={expenses} members={members} />
							<ExpenseList
								expenses={expenses}
								members={members}
								onEditExpense={setEditingExpense}
								onDeleteExpense={handleDeleteExpense}
							/>
							<SettlementCalculator expenses={expenses} members={members} />
						</>
					)}
				</div>
			</div>
		</section>
	);
}
