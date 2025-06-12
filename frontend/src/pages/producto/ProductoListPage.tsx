import React, { useEffect, useState } from "react";
import { ProductoList } from "../../components/producto/ProductoList";
import { ProductService } from "../../services/productService";
import { Producto } from "../../types/producto";

export const ProductoListPage: React.FC = () => {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProductos = async () => {
            setLoading(true);
            setProductos(await ProductService.getAll());
            setLoading(false);
        };
        fetchProductos();
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center bg-white">
            <h1 className="text-3xl font-bold text-primary-300 mb-8 mt-12 text-center drop-shadow-sm">
                Lista de Productos
            </h1>
            <ProductoList productos={productos} loading={loading} />
        </div>
    );
};