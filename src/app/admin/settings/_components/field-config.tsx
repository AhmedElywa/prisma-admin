"use client";

import React, { useState } from "react";
import { AdminModel, AdminField } from "@/lib/admin/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GripVertical, ChevronDown, ChevronRight, Link2 } from "lucide-react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { RelationFieldSettings } from "./relation-field-settings";

interface FieldConfigProps {
	model: AdminModel;
	onUpdateField: (fieldId: string, updates: Partial<AdminField>) => void;
	onReorderFields: (fields: AdminField[]) => void;
}

export function FieldConfig({
	model,
	onUpdateField,
	onReorderFields,
}: FieldConfigProps) {
	const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());
	const [draggedField, setDraggedField] = useState<string | null>(null);
	const [dragOverField, setDragOverField] = useState<string | null>(null);
	const [dragOverPosition, setDragOverPosition] = useState<
		"top" | "bottom" | null
	>(null);

	const toggleFieldExpanded = (fieldId: string) => {
		const newExpanded = new Set(expandedFields);
		if (newExpanded.has(fieldId)) {
			newExpanded.delete(fieldId);
		} else {
			newExpanded.add(fieldId);
		}
		setExpandedFields(newExpanded);
	};

	const handleDragStart = (e: React.DragEvent, fieldId: string) => {
		setDraggedField(fieldId);
		e.dataTransfer.effectAllowed = "move";
		// Add dragging class to body to change cursor globally
		document.body.classList.add("dragging");
	};

	const handleDragOver = (e: React.DragEvent, fieldId: string) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";

		if (draggedField === fieldId) return;

		// Calculate if we're in the top or bottom half of the row
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		const y = e.clientY - rect.top;
		const position = y < rect.height / 2 ? "top" : "bottom";

		setDragOverField(fieldId);
		setDragOverPosition(position);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		// Only clear if we're leaving the table entirely
		if (!e.relatedTarget || !(e.relatedTarget as HTMLElement).closest("tr")) {
			setDragOverField(null);
			setDragOverPosition(null);
		}
	};

	const handleDrop = (e: React.DragEvent, targetFieldId: string) => {
		e.preventDefault();

		if (!draggedField || draggedField === targetFieldId) {
			setDraggedField(null);
			setDragOverField(null);
			setDragOverPosition(null);
			return;
		}

		const fields = [...model.fields];
		const draggedIndex = fields.findIndex((f) => f.id === draggedField);
		const targetIndex = fields.findIndex((f) => f.id === targetFieldId);

		if (draggedIndex === -1 || targetIndex === -1) {
			setDraggedField(null);
			setDragOverField(null);
			setDragOverPosition(null);
			return;
		}

		// Remove dragged field
		const [draggedFieldObj] = fields.splice(draggedIndex, 1);

		// Calculate new position based on drag position
		let newIndex = targetIndex;
		if (dragOverPosition === "bottom") {
			newIndex = draggedIndex < targetIndex ? targetIndex : targetIndex + 1;
		} else {
			newIndex = draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;
		}

		// Insert at new position
		fields.splice(newIndex, 0, draggedFieldObj);

		// Update order property for all fields
		const reorderedFields = fields.map((field, idx) => ({
			...field,
			order: idx,
		}));

		onReorderFields(reorderedFields);
		setDraggedField(null);
		setDragOverField(null);
		setDragOverPosition(null);
	};

	const handleDragEnd = () => {
		setDraggedField(null);
		setDragOverField(null);
		setDragOverPosition(null);
		// Remove dragging class from body
		document.body.classList.remove("dragging");
	};

	return (
		<div className="overflow-x-auto">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-[40px]"></TableHead>
						<TableHead className="min-w-[150px]">Field</TableHead>
						<TableHead className="min-w-[150px]">Display Name</TableHead>
						<TableHead className="text-center w-[70px]">Read</TableHead>
						<TableHead className="text-center w-[70px]">Create</TableHead>
						<TableHead className="text-center w-[70px]">Update</TableHead>
						<TableHead className="text-center w-[70px]">Filter</TableHead>
						<TableHead className="text-center w-[70px]">Sort</TableHead>
						<TableHead className="w-[50px]"></TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{model.fields.map((field, index) => (
						<React.Fragment key={`field-${field.id}-${index}`}>
							<TableRow
								draggable
								onDragStart={(e) => handleDragStart(e, field.id)}
								onDragOver={(e) => handleDragOver(e, field.id)}
								onDragLeave={handleDragLeave}
								onDrop={(e) => handleDrop(e, field.id)}
								onDragEnd={handleDragEnd}
								className={`
                  relative transition-all
                  ${draggedField === field.id ? "opacity-20" : ""} 
                  ${expandedFields.has(field.id) ? "border-b-0" : ""}
                  ${draggedField && draggedField !== field.id ? "cursor-move" : ""}
                `}
								style={{
									borderTop:
										dragOverField === field.id && dragOverPosition === "top"
											? "2px solid hsl(var(--primary))"
											: undefined,
									borderBottom:
										dragOverField === field.id && dragOverPosition === "bottom"
											? "2px solid hsl(var(--primary))"
											: undefined,
								}}
							>
								<TableCell className="py-2">
									<Button
										variant="ghost"
										size="icon"
										className="cursor-move h-8 w-8 hover:bg-muted"
										onMouseDown={(e) =>
											(e.currentTarget.style.cursor = "grabbing")
										}
										onMouseUp={(e) => (e.currentTarget.style.cursor = "move")}
									>
										<GripVertical className="h-4 w-4" />
									</Button>
								</TableCell>
								<TableCell className="font-medium py-2">
									<div>
										<div className="flex items-center gap-1">
											{field.name}
											{field.required && (
												<span className="text-red-500">*</span>
											)}
										</div>
										<div className="text-xs text-muted-foreground">
											{field.type}
											{field.list && "[]"}
											{!field.relationField ? (
												<>
													{" • "}
													{field.kind} field
													{field.unique && ", unique"}
													{field.isId && ", primary key"}
												</>
											) : (
												<>
													{" • "}
													{field.list ? "one-to-many" : "many-to-one"} →{" "}
													{field.type}
												</>
											)}
										</div>
									</div>
								</TableCell>
								<TableCell className="py-2">
									<Input
										value={field.title}
										onChange={(e) =>
											onUpdateField(field.id, { title: e.target.value })
										}
										className="h-8 w-full"
									/>
								</TableCell>
								<TableCell className="text-center py-2">
									<Checkbox
										checked={field.read}
										onCheckedChange={(checked) =>
											onUpdateField(field.id, { read: !!checked })
										}
									/>
								</TableCell>
								<TableCell className="text-center py-2">
									<Checkbox
										checked={field.create}
										onCheckedChange={(checked) =>
											onUpdateField(field.id, { create: !!checked })
										}
										disabled={field.isId || field.relationField}
									/>
								</TableCell>
								<TableCell className="text-center py-2">
									<Checkbox
										checked={field.update}
										onCheckedChange={(checked) =>
											onUpdateField(field.id, { update: !!checked })
										}
										disabled={field.isId || field.relationField}
									/>
								</TableCell>
								<TableCell className="text-center py-2">
									<Checkbox
										checked={field.filter}
										onCheckedChange={(checked) =>
											onUpdateField(field.id, { filter: !!checked })
										}
									/>
								</TableCell>
								<TableCell className="text-center py-2">
									<Checkbox
										checked={field.sort}
										onCheckedChange={(checked) =>
											onUpdateField(field.id, { sort: !!checked })
										}
										disabled={field.list || field.relationField}
									/>
								</TableCell>
								<TableCell className="py-2">
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8"
										onClick={() => toggleFieldExpanded(field.id)}
									>
										{expandedFields.has(field.id) ? (
											<ChevronDown className="h-4 w-4" />
										) : (
											<ChevronRight className="h-4 w-4" />
										)}
									</Button>
								</TableCell>
							</TableRow>
							{expandedFields.has(field.id) && (
								<TableRow className="bg-muted/50">
									<TableCell colSpan={1} className="p-0">
										{/* Empty cells for alignment */}
									</TableCell>
									<TableCell colSpan={7} className="p-0">
										<div className="py-4 px-2 space-y-3 border-t">
											{field.relationField ? (
												<RelationFieldSettings
													field={field}
													onUpdateField={(updates) =>
														onUpdateField(field.id, updates)
													}
												/>
											) : field.type === "String" ? (
												<div className="space-y-2">
													<p className="text-sm font-medium mb-3">
														Field Input Type
													</p>
													<div className="space-y-2">
														<label className="flex items-center space-x-2 cursor-pointer">
															<input
																type="radio"
																name={`field-type-${field.id}`}
																checked={!field.editor && !field.upload}
																onChange={() =>
																	onUpdateField(field.id, {
																		editor: false,
																		upload: false,
																	})
																}
																className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
															/>
															<span className="text-sm">
																Standard Text Input
															</span>
														</label>
														<label className="flex items-center space-x-2 cursor-pointer">
															<input
																type="radio"
																name={`field-type-${field.id}`}
																checked={field.editor === true}
																onChange={() =>
																	onUpdateField(field.id, {
																		editor: true,
																		upload: false,
																	})
																}
																className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
															/>
															<span className="text-sm">Rich Text Editor</span>
														</label>
														<label className="flex items-center space-x-2 cursor-pointer">
															<input
																type="radio"
																name={`field-type-${field.id}`}
																checked={field.upload === true}
																onChange={() =>
																	onUpdateField(field.id, {
																		upload: true,
																		editor: false,
																	})
																}
																className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
															/>
															<span className="text-sm">File Upload</span>
														</label>
													</div>
												</div>
											) : (
												<div className="text-sm text-muted-foreground">
													No additional options available for {field.type}{" "}
													fields.
												</div>
											)}
										</div>
									</TableCell>
								</TableRow>
							)}
						</React.Fragment>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
