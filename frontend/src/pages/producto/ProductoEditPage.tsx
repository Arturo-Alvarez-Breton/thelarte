import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProductService } from "../../services/productService";
import { Producto } from "../../types/producto";

export const ProductoEditPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();

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

    // Maneja cambios en los campos del formulario, con type guard para checkbox
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        if (!producto) return;
        const { name, value, type } = e.target;
        setProducto({
            ...producto,
            [name]:
                type === "checkbox"
                    ? (e.target as HTMLInputElement).checked
                    : value,
        });
    };

    // Maneja el envío del formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !producto) return;
        try {
            await ProductService.update(id, producto);
            navigate(`/productos/${id}`); // Redirige al detalle del producto actualizado
        } catch {
            setError("Error al actualizar el producto");
        }
    };

    if (loading) return <div>Cargando...</div>;
    if (error) return <div style={{ color: "red" }}>{error}</div>;
    if (!producto) return null;

    return (
        <div>
            <h2>Editar producto</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Nombre:
                    <input
                        name="nombre"
                        value={producto.nombre}
                        onChange={handleChange}
                        required
                    />
                </label>
                <br />
                <label>
                    Tipo:
                    <input name="tipo" value={producto.tipo} onChange={handleChange} />
                </label>
                <br />
                <label>
                    Descripción:
                    <textarea
                        name="descripcion"
                        value={producto.descripcion}
                        onChange={handleChange}
                    />
                </label>
                <br />
                <label>
                    Marca:
                    <input name="marca" value={producto.marca} onChange={handleChange} />
                </label>
                <br />
                <label>
                    ITBIS:
                    <input
                        name="itbis"
                        value={producto.itbis}
                        onChange={handleChange}
                        type="number"
                    />
                </label>
                <br />
                <label>
                    Precio:
                    <input
                        name="precio"
                        value={producto.precio}
                        onChange={handleChange}
                        type="number"
                    />
                </label>
                <br />
                <label>
                    Activo:
                    <input
                        name="activo"
                        type="checkbox"
                        checked={producto.activo}
                        onChange={handleChange}
                    />
                </label>
                <br />
                <button type="submit">Guardar cambios</button>
            </form>
        </div>
    );
};