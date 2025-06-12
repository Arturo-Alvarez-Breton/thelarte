import React from "react";
import { ProductoForm } from "../../components/producto/ProductoForm";
import { ProductService } from "../../services/productService";
import { useNavigate } from "react-router-dom";
import { Producto } from "../../types/producto";

export const ProductoFormPage: React.FC = () => {
    const navigate = useNavigate();

    const handleCreate = async (data: Omit<Producto, "id">) => {
        await ProductService.create(data);
        // Después de crear, redirige a la lista
        navigate("/productos");
    };

    return (
        <div className="min-h-screen flex flex-col items-center bg-white">
            <h1 className="text-3xl font-bold text-primary-300 mb-8 mt-12 text-center drop-shadow-sm">
                Registrar Producto
            </h1>
            <ProductoForm onSubmit={handleCreate} />
        </div>
    );
};