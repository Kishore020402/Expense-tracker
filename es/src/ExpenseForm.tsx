import React, { useState, useEffect } from "react";
import { Plus, Edit2, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Expense, CURRENCIES, Member, Currency } from "./lib/types";

interface ExpenseFormProps {
	expense: Partial<Expense>;
	members: Member[];
	onSubmit: (expense: Expense) => void;
	onChange: (field: keyof Expense, value: any) => void;
	onReset: () => void;
	isEditing: boolean;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
	expense,
	members,
	onSubmit,
	onChange,
	onReset,
	isEditing,
}) => {
	const initialFormState: Partial<Expense> = {
		description: "",
		amount: 0,
		category: "",
		paidBy: "",
		date: new Date().toISOString().split("T")[0],
		currency: "USD" as Currency,
		splitWith: [],
	};

	const [formData, setFormData] = useState<Partial<Expense>>({
		...initialFormState,
		...expense,
	});

	useEffect(() => {
		setFormData({ ...initialFormState, ...expense });
	}, [expense]);

	const handleChange = (field: keyof Expense, value: any) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		onChange(field, value);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (
			!formData.description ||
			!formData.amount ||
			!formData.paidBy ||
			!formData.category ||
			!formData.date ||
			!formData.currency
		) {
			alert("Please fill all required fields");
			return;
		}

		onSubmit({
			id: formData.id || Date.now().toString(),
			description: formData.description,
			amount: Number(formData.amount),
			paidBy: formData.paidBy,
			date: formData.date,
			category: formData.category,
			currency: formData.currency as Currency,
			splitWith: formData.splitWith || [],
		});

		if (!isEditing) {
			setFormData(initialFormState);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<h3 className="text-lg font-semibold">
				{isEditing ? "Edit Expense" : "Add Expense"}
			</h3>

			<div className="grid gap-4 md:grid-cols-2">
				<Input
					placeholder="Description"
					value={formData.description || ""}
					onChange={(e) => handleChange("description", e.target.value)}
					required
				/>

				<div className="flex gap-2">
					<Input
						type="number"
						placeholder="Amount"
						value={formData.amount || ""}
						onChange={(e) => handleChange("amount", Number(e.target.value))}
						required
						min="0"
						step="0.01"
					/>
					<Select
						value={formData.currency}
						onValueChange={(value) => handleChange("currency", value)}
					>
						<SelectTrigger className="w-24">
							<SelectValue placeholder="Currency" />
						</SelectTrigger>
						<SelectContent>
							{CURRENCIES.map((curr) => (
								<SelectItem key={curr} value={curr}>
									{curr}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<Select
					value={formData.paidBy}
					onValueChange={(value) => handleChange("paidBy", value)}
				>
					<SelectTrigger>
						<SelectValue placeholder="Paid by" />
					</SelectTrigger>
					<SelectContent>
						{members.map((member) => (
							<SelectItem key={member.id} value={member.id}>
								{member.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Input
					type="date"
					value={formData.date || ""}
					onChange={(e) => handleChange("date", e.target.value)}
					required
				/>

				<Input
					placeholder="Category"
					value={formData.category || ""}
					onChange={(e) => handleChange("category", e.target.value)}
					required
				/>

				<Select
					value={formData.splitWith?.join(",")}
					onValueChange={(value) => handleChange("splitWith", value.split(","))}
				>
					<SelectTrigger>
						<SelectValue placeholder="Split with" />
					</SelectTrigger>
					<SelectContent>
						{members.map((member) => (
							<SelectItem key={member.id} value={member.id}>
								{member.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="flex gap-2">
				<Button type="submit">
					{isEditing ? (
						<>
							<Edit2 className="h-4 w-4 mr-2" />
							Update Expense
						</>
					) : (
						<>
							<Plus className="h-4 w-4 mr-2" />
							Add Expense
						</>
					)}
				</Button>
				{isEditing && (
					<Button type="button" variant="outline" onClick={onReset}>
						<RefreshCcw className="h-4 w-4 mr-2" />
						Cancel
					</Button>
				)}
			</div>
		</form>
	);
};

export default ExpenseForm;
