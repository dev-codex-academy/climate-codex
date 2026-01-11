import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "@/components/Modal"; // Use the shared Modal component
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
import { createCohort, updateCohort } from "@/services/cohortService";

export const CohortModal = ({
    isOpen,
    onClose,
    onSuccess,
    cohortToEdit = null,
    instructors = []
}) => {
    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();

    const selectedInstructor = watch("instructor");

    useEffect(() => {
        if (cohortToEdit) {
            setValue("name_cohort", cohortToEdit.name_cohort);
            setValue("start_date", cohortToEdit.start_date);
            setValue("end_date", cohortToEdit.end_date);
            setValue("instructor", String(cohortToEdit.instructor));
        } else {
            reset({
                name_cohort: "",
                start_date: "",
                end_date: "",
                instructor: ""
            });
        }
    }, [cohortToEdit, isOpen, setValue, reset]);

    const onSubmit = async (data) => {
        try {
            const payload = {
                ...data,
                instructor: Number(data.instructor)
            };

            if (cohortToEdit) {
                await updateCohort(cohortToEdit.id, payload);
            } else {
                await createCohort(payload);
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error saving cohort:", error);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={cohortToEdit ? "Edit Cohort" : "Create Cohort"}
            widthClass="sm:w-[500px]"
            showFooter={false}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name_cohort">Cohort Name</Label>
                    <Input
                        id="name_cohort"
                        {...register("name_cohort", { required: "Name is required" })}
                        className="bg-codex-input-fondo dark:bg-codex-input-dark-fondo"
                    />
                    {errors.name_cohort && <span className="text-red-500 text-xs">{errors.name_cohort.message}</span>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="start_date">Start Date</Label>
                        <Input
                            id="start_date"
                            type="date"
                            {...register("start_date", { required: "Start date is required" })}
                            className="bg-codex-input-fondo dark:bg-codex-input-dark-fondo"
                        // Adding onClick to prevent focus issues in some browsers if needed, typically standard input works
                        />
                        {errors.start_date && <span className="text-red-500 text-xs">{errors.start_date.message}</span>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="end_date">End Date</Label>
                        <Input
                            id="end_date"
                            type="date"
                            {...register("end_date", { required: "End date is required" })}
                            className="bg-codex-input-fondo dark:bg-codex-input-dark-fondo"
                        />
                        {errors.end_date && <span className="text-red-500 text-xs">{errors.end_date.message}</span>}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="instructor">Instructor</Label>
                    <Select
                        onValueChange={(val) => setValue("instructor", val)}
                        value={selectedInstructor}
                    >
                        <SelectTrigger className="bg-codex-input-fondo dark:bg-codex-input-dark-fondo">
                            <SelectValue placeholder="Select an instructor" />
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

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save</Button>
                </div>
            </form>
        </Modal>
    );
};
