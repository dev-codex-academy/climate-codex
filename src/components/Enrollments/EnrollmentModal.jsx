import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { createEnrollment, updateEnrollment } from "@/services/enrollmentService";

export const EnrollmentModal = ({
    isOpen,
    onClose,
    onSuccess,
    enrollmentToEdit = null,
    cohorts = [],
    instructors = [],
    tas = []
}) => {
    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
    const [selectedTas, setSelectedTas] = useState([]);

    const selectedCohort = watch("cohort");
    const selectedInstructor = watch("instructor");

    useEffect(() => {
        if (enrollmentToEdit) {
            setValue("pathway_name", enrollmentToEdit.pathway_name);

            // Handle Cohort
            const cohortId = enrollmentToEdit.cohort?.id || enrollmentToEdit.cohort;
            setValue("cohort", String(cohortId || ""));

            // Handle Instructor
            const instructorId = enrollmentToEdit.instructor?.id || enrollmentToEdit.instructor;
            setValue("instructor", String(instructorId || ""));

            // Pre-fill TAs
            const initialTas = enrollmentToEdit.teaching_assistants || [];
            setSelectedTas(initialTas.map(ta => ta.id));
        } else {
            reset({
                pathway_name: "",
                cohort: "",
                instructor: ""
            });
            setSelectedTas([]);
        }
    }, [enrollmentToEdit, isOpen, setValue, reset]);

    const handleTaChange = (taId, checked) => {
        if (checked) {
            setSelectedTas(prev => [...prev, taId]);
        } else {
            setSelectedTas(prev => prev.filter(id => id !== taId));
        }
    };

    const onSubmit = async (data) => {
        try {
            // Format TAs detailed objects as required by backend validation
            const formattedTas = selectedTas.map(id => {
                const taObj = tas.find(t => t.id === id);
                return { id: taObj.id, name: taObj.name || taObj.username || taObj.email };
            });

            const payload = {
                ...data,
                cohort: data.cohort,
                instructor: data.instructor,
                teaching_assistants: formattedTas
            };

            if (enrollmentToEdit) {
                await updateEnrollment(enrollmentToEdit.id, payload);
            } else {
                await createEnrollment(payload);
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error saving enrollment:", error);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={enrollmentToEdit ? "Edit Enrollment" : "Create Enrollment"}
            widthClass="sm:w-[600px]"
            showFooter={false}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="pathway_name">Pathway Name</Label>
                    <Input
                        id="pathway_name"
                        {...register("pathway_name", { required: "Pathway name is required" })}
                        className="bg-codex-input-fondo dark:bg-codex-input-dark-fondo"
                    />
                    {errors.pathway_name && <span className="text-red-500 text-xs">{errors.pathway_name.message}</span>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="cohort">Cohort</Label>
                        {enrollmentToEdit ? (
                            // Read-only view for Edit mode
                            <>
                                <Input
                                    disabled
                                    value={cohorts.find(c => String(c.id) === String(enrollmentToEdit.cohort.id || enrollmentToEdit.cohort))?.name_cohort || "Unknown Cohort"}
                                    className="bg-muted text-muted-foreground opacity-100" // Custom styling to look like a label but disabled
                                />
                                <input type="hidden" {...register("cohort")} />
                            </>
                        ) : (
                            // Select dropdown for Create mode
                            <>
                                <Select
                                    onValueChange={(val) => setValue("cohort", val)}
                                    value={selectedCohort}
                                >
                                    <SelectTrigger className="bg-codex-input-fondo dark:bg-codex-input-dark-fondo">
                                        <SelectValue placeholder="Select cohort" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[200px]">
                                        {cohorts.map((c) => (
                                            <SelectItem key={c.id} value={String(c.id)}>
                                                {c.name_cohort}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <input type="hidden" {...register("cohort", { required: "Cohort is required" })} />
                                {errors.cohort && <span className="text-red-500 text-xs">{errors.cohort.message}</span>}
                            </>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="instructor">Instructor</Label>
                        <Select
                            onValueChange={(val) => setValue("instructor", val)}
                            value={selectedInstructor}
                        >
                            <SelectTrigger className="bg-codex-input-fondo dark:bg-codex-input-dark-fondo">
                                <SelectValue placeholder="Select instructor" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                                {instructors.map((inst) => (
                                    <SelectItem key={inst.id} value={String(inst.id)}>
                                        {inst.name || inst.username || inst.email}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <input type="hidden" {...register("instructor", { required: "Instructor is required" })} />
                        {errors.instructor && <span className="text-red-500 text-xs">{errors.instructor.message}</span>}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Teaching Assistants</Label>
                    <div className="border rounded-md p-3 max-h-[200px] overflow-y-auto space-y-2 bg-codex-input-fondo dark:bg-codex-input-dark-fondo">
                        {tas.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center">No TAs available</p>
                        ) : (
                            tas.map((ta) => (
                                <div key={ta.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`ta-${ta.id}`}
                                        checked={selectedTas.includes(ta.id)}
                                        onCheckedChange={(checked) => handleTaChange(ta.id, checked)}
                                    />
                                    <Label htmlFor={`ta-${ta.id}`} className="cursor-pointer font-normal">
                                        {ta.name || ta.username || ta.email}
                                    </Label>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save</Button>
                </div>
            </form>
        </Modal>
    );
};
