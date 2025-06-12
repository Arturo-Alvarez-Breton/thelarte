import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ProductService } from "../../services/productService";
import { Producto } from "../../types/producto";

const ProductoDetailPage: React.FC = () => {
    const { id } = useParams();
    const [producto, setProducto] = useState<Producto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        setError(null);
        ProductService.getById(id)
            .then(setProducto)
            .catch(() => setError("Producto no encontrado"))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div>Cargando...</div>;
    if (error) return <div style={{ color: "red" }}>{error}</div>;
    if (!producto) return null;

    return (
        <div>
            <h2>Detalle del producto</h2>
            <p>ID: {producto.id}</p>
            <p>Nombre: {producto.nombre}</p>
            <p>Tipo: {producto.tipo}</p>
            <p>Descripción: {producto.descripcion}</p>
            <p>Marca: {producto.marca}</p>
            <p>ITBIS: {producto.itbis}</p>
            <p>Precio: {producto.precio}</p>
            <p>Activo: {producto.activo ? "Sí" : "No"}</p>
            {/* Agrega más campos según tu modelo */}
        </div>
    );
};

export default ProductoDetailPage;