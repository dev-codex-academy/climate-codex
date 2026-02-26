import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table } from "../components/Table";
import { Button } from "../components/ui/button";
import { Plus, Download } from "lucide-react";
import { getCategories, deleteCategory, getCategoryAttributes } from "../services/categoryService";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";

export const Category = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [attributes, setAttributes] = useState([]);
    const navigate = useNavigate();

    const staticColumns = [
        { key: "name", label: "Name" },
        { key: "description", label: "Description" },
        {
            key: "parent",
            label: "Parent Category",
            render: (value, row) => {
                if (!value) return "-";
                return typeof value === 'object' ? value.name : value;
            }
        },
    ];

    const [columns, setColumns] = useState(staticColumns);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [categoriesData, attributesData] = await Promise.all([
                getCategories(),
                getCategoryAttributes()
            ]);

            const processedCategories = categoriesData.map(category => ({
                ...category,
                ...(category.attributes || {})
            }));
            setCategories(processedCategories);
            setAttributes(attributesData);

            // Dynamic columns from attributes
            const dynamicColumns = attributesData.map(attr => ({
                key: attr.name,
                label: attr.label
            }));

            setColumns([...staticColumns, ...dynamicColumns]);

        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (category) => {
        navigate(`/category/${category.id}`);
    };

    const handleDelete = async (category) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await deleteCategory(category.id);
                fetchData();
                Swal.fire(
                    'Deleted!',
                    'Category has been deleted.',
                    'success'
                );
            } catch (error) {
                console.error("Error deleting category", error);
                Swal.fire(
                    'Error!',
                    'There was an error deleting the category.',
                    'error'
                );
            }
        }
    };

    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(categories);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Categories");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
        saveAs(data, "categories_report.xlsx");
    };

    return (
        <div className="h-full flex flex-col p-2 w-full">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-codex-texto-primary dark:text-codex-texto-dark-primary">
                        Categories
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your categories and subcategories.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExportExcel}>
                        <Download className="mr-2 h-4 w-4" /> Export Excel
                    </Button>
                    <Button onClick={() => navigate("/category/new")}>
                        <Plus className="mr-2 h-4 w-4" /> Add Category
                    </Button>
                </div>
            </div>

            <div className="bg-white dark:bg-codex-fondo-secondary p-2 rounded-lg shadow flex-1 min-h-0 overflow-hidden flex flex-col">
                <Table
                    data={categories}
                    columns={columns}
                    onEdit={handleEdit}
                    onAskDelete={handleDelete}
                    searchable={true}
                />
            </div>
        </div>
    );
};
