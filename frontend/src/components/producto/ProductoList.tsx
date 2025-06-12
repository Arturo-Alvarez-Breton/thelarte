import React from "react";
import { Producto } from "../../types/producto";

type ProductoListProps = {
    productos: Producto[];
    loading?: boolean;
};

export const ProductoList: React.FC<ProductoListProps> = ({ productos, loading }) => {
    if (loading) return <div>Cargando...</div>;
    return (
        <div>
            <h2>Lista de Productos</h2>
            <ul>
                {productos.map((prod) => (
                    <li key={prod.id}>
                        {prod.nombre} - {prod.precio} {prod.activo ? "(Activo)" : "(Inactivo)"}
                    </li>
                ))}
            </ul>
        </div>
    );
};