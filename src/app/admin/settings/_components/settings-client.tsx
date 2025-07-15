"use client";

import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ModelSettings } from "./model-settings";
import { GeneralSettings } from "./general-settings";
import { Settings2, Database } from "lucide-react";
import { ModelSelector } from "./model-selector";
import { AdminSettings, AdminModel } from "@/lib/admin/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X, ChevronsUpDown } from "lucide-react";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { saveModelSettings } from "@/lib/actions/settings";
import { toast } from "sonner";

interface SettingsClientProps {
	settings: AdminSettings;
}

export function SettingsClient({ settings }: SettingsClientProps) {
	const [models, setModels] = useState<AdminModel[]>(settings.models);
	const [selectedModel, setSelectedModel] = useState<string | null>(
		settings.models[0]?.id || null,
	);
	const [activeTab, setActiveTab] = useState("models");
	const [displayFieldsOpen, setDisplayFieldsOpen] = useState(false);

	const currentModel = models.find((m) => m.id === selectedModel);

	const updateModel = (updates: Partial<AdminModel>) => {
		if (!currentModel) return;

		setModels((prevModels) =>
			prevModels.map((m) =>
				m.id === currentModel.id ? { ...m, ...updates } : m,
			),
		);
	};

	const handleSave = async () => {
		try {
			await saveModelSettings(models);
			toast.success("Settings saved successfully");
		} catch (error) {
			toast.error("Failed to save settings");
		}
	};

	return (
		<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
			<TabsList className="grid w-full max-w-md grid-cols-2">
				<TabsTrigger value="models">Models</TabsTrigger>
				<TabsTrigger value="settings">Settings</TabsTrigger>
			</TabsList>

			<TabsContent value="models" className="space-y-6">
				{/* Model Configuration */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Database className="h-5 w-5" />
							Model Configuration
						</CardTitle>
						<CardDescription>
							Configure the basic settings for your selected model
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Top row: Model, Display Name, ID Field */}
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
							<div className="space-y-2">
								<Label>Model</Label>
								<ModelSelector
									models={models}
									selectedModel={selectedModel}
									onSelectModel={setSelectedModel}
								/>
							</div>

							{currentModel && (
								<>
									<div className="space-y-2">
										<Label htmlFor="displayName">Display Name</Label>
										<Input
											id="displayName"
											value={currentModel.name}
											onChange={(e) => updateModel({ name: e.target.value })}
											placeholder="Display name for this model"
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="idField">ID Field</Label>
										<Select
											value={currentModel.idField}
											onValueChange={(value) => updateModel({ idField: value })}
										>
											<SelectTrigger id="idField" className="w-full">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{currentModel.fields
													.filter((f) => f.isId || f.unique)
													.map((field) => (
														<SelectItem key={field.id} value={field.name}>
															{field.name} ({field.type})
														</SelectItem>
													))}
											</SelectContent>
										</Select>
									</div>
								</>
							)}
						</div>

						{/* Bottom row: Display Fields and Permissions */}
						{currentModel && (
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								{/* Display Fields Multi-Select */}
								<div className="space-y-2">
									<Label>Display Fields</Label>
									<Popover
										open={displayFieldsOpen}
										onOpenChange={setDisplayFieldsOpen}
									>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												size="lg"
												className="w-full justify-between text-left font-normal hover:bg-transparent"
											>
												<div className="flex flex-wrap gap-1 flex-1">
													{currentModel.displayFields.length > 0 ? (
														currentModel.displayFields.map((fieldName) => {
															const field = currentModel.fields.find(
																(f) => f.name === fieldName,
															);
															return field ? (
																<Badge
																	key={fieldName}
																	variant="secondary"
																	className="mr-1 rounded-full"
																>
																	{field.title}
																	<span
																		role="button"
																		tabIndex={0}
																		className="ml-1 p-0.5 rounded-full hover:bg-destructive/20 cursor-pointer inline-flex"
																		onKeyDown={(e) => {
																			if (e.key === "Enter" || e.key === " ") {
																				e.preventDefault();
																				e.stopPropagation();
																				updateModel({
																					displayFields:
																						currentModel.displayFields.filter(
																							(f) => f !== fieldName,
																						),
																				});
																			}
																		}}
																		onMouseDown={(e) => {
																			e.preventDefault();
																			e.stopPropagation();
																		}}
																		onClick={(e) => {
																			e.preventDefault();
																			e.stopPropagation();
																			updateModel({
																				displayFields:
																					currentModel.displayFields.filter(
																						(f) => f !== fieldName,
																					),
																			});
																		}}
																	>
																		<X className="h-2 w-2" />
																	</span>
																</Badge>
															) : null;
														})
													) : (
														<span className="text-muted-foreground">
															Select fields...
														</span>
													)}
												</div>
												<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-full p-0" align="start">
											<Command>
												<CommandInput placeholder="Search fields..." />
												<CommandEmpty>No field found.</CommandEmpty>
												<CommandGroup>
													{currentModel.fields
														.filter((f) => !f.relationField && !f.list)
														.map((field) => (
															<CommandItem
																key={field.id}
																className="data-[selected=true]:bg-accent/50"
																onSelect={() => {
																	const isSelected =
																		currentModel.displayFields.includes(
																			field.name,
																		);
																	if (isSelected) {
																		updateModel({
																			displayFields:
																				currentModel.displayFields.filter(
																					(f) => f !== field.name,
																				),
																		});
																	} else {
																		updateModel({
																			displayFields: [
																				...currentModel.displayFields,
																				field.name,
																			],
																		});
																	}
																}}
															>
																<Checkbox
																	checked={currentModel.displayFields.includes(
																		field.name,
																	)}
																	className="mr-2"
																/>
																{field.title}
															</CommandItem>
														))}
												</CommandGroup>
											</Command>
										</PopoverContent>
									</Popover>
								</div>

								{/* Permissions */}
								<div className="space-y-2">
									<Label>Model Permissions</Label>
									<div className="flex items-center space-x-4 border rounded-md h-10 px-2.5 shadow-xs">
										<label className="flex items-center gap-2 cursor-pointer">
											<Checkbox
												checked={currentModel.create}
												onCheckedChange={(checked) =>
													updateModel({ create: !!checked })
												}
											/>
											<span className="text-sm">Create</span>
										</label>

										<label className="flex items-center gap-2 cursor-pointer">
											<Checkbox
												checked={currentModel.update}
												onCheckedChange={(checked) =>
													updateModel({ update: !!checked })
												}
											/>
											<span className="text-sm">Update</span>
										</label>

										<label className="flex items-center gap-2 cursor-pointer">
											<Checkbox
												checked={currentModel.delete}
												onCheckedChange={(checked) =>
													updateModel({ delete: !!checked })
												}
											/>
											<span className="text-sm">Delete</span>
										</label>
									</div>
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Field Configuration */}
				{currentModel ? (
					<ModelSettings model={currentModel} />
				) : (
					<Card>
						<CardContent className="flex items-center justify-center h-[400px] text-muted-foreground">
							<div className="text-center">
								<Database className="h-12 w-12 mx-auto mb-4" />
								<p>Select a model to configure its settings</p>
							</div>
						</CardContent>
					</Card>
				)}
			</TabsContent>

			<TabsContent value="settings" className="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>General Settings</CardTitle>
						<CardDescription>
							Configure global admin panel settings
						</CardDescription>
					</CardHeader>
					<CardContent>
						<GeneralSettings />
					</CardContent>
				</Card>
			</TabsContent>
		</Tabs>
	);
}
