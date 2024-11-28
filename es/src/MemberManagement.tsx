// MemberManagement.tsx
import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Member } from "./lib/types";

interface MemberManagementProps {
	members: Member[];
	onAddMember: (member: Member) => void;
	onRemoveMember: (id: string) => void;
}

const MemberManagement: React.FC<MemberManagementProps> = ({
	members,
	onAddMember,
	onRemoveMember,
}) => {
	const [newMember, setNewMember] = useState("");

	const handleAddMember = (e: React.FormEvent) => {
		e.preventDefault();
		if (newMember.trim() && !members.some((m) => m.name === newMember.trim())) {
			onAddMember({
				id: Date.now().toString(),
				name: newMember.trim(),
				email: "", // Optional field
			});
			setNewMember("");
		}
	};

	return (
		<div className="space-y-4">
			<h3 className="text-lg font-semibold">Group Members</h3>
			<form onSubmit={handleAddMember} className="flex gap-2">
				<Input
					placeholder="Add member name"
					value={newMember}
					onChange={(e) => setNewMember(e.target.value)}
					className="max-w-xs"
				/>
				<Button type="submit">
					<Plus className="h-4 w-4 mr-2" />
					Add
				</Button>
			</form>
			<div className="flex flex-wrap gap-2">
				{members.map((member) => (
					<div
						key={member.id}
						className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2"
					>
						{member.name}
						<button
							onClick={() => onRemoveMember(member.id)}
							className="hover:text-blue-600"
						>
							<X className="h-4 w-4" />
						</button>
					</div>
				))}
			</div>
		</div>
	);
};
export default MemberManagement;
