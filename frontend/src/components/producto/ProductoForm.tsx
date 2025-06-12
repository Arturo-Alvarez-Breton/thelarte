import React from "react";
import { useForm } from "react-hook-form";
import { Producto } from "../../types/producto";

type ProductoFormProps = {
    onSubmit: (data: Omit<Producto, "id">) => void;
    initialValues?: Partial<Omit<Producto, "id">>;
};

export const ProductoForm: React.FC<ProductoFormProps> = ({ onSubmit, initialValues }) => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<Omit<Producto, "id">>({
        defaultValues: initialValues,
    });

    const handleFormSubmit = (data: Omit<Producto, "id">) => {
        onSubmit(data);
        reset();
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md mb-10">
            <div className="grid grid-cols-2 gap-6">
                <div className="form-group">
                    <label className="block text-primary-200 mb-1">Nombre</label>
                    <input {...register("nombre", { required: "El nombre es obligatorio" })} className="input-field" placeholder="Nombre" />
                    {errors.nombre && <span className="error-message">{errors.nombre.message}</span>}
                </div>
                <div className="form-group">
                    <label className="block text-primary-200 mb-1">Tipo</label>
                    <input {...register("tipo")} className="input-field" placeholder="Tipo" />
                </div>
                <div className="form-group col-span-2">
                    <label className="block text-primary-200 mb-1">Descripción</label>
                    <input {...register("descripcion")} className="input-field" placeholder="Descripción" />
                </div>
                <div className="form-group">
                    <label className="block text-primary-200 mb-1">Marca</label>
                    <input {...register("marca")} className="input-field" placeholder="Marca" />
                </div>
                <div className="form-group">
                    <label className="block text-primary-200 mb-1">ITBIS</label>
                    <input type="number" step="0.01" {...register("itbis")} className="input-field" placeholder="ITBIS" />
                </div>
                <div className="form-group">
                    <label className="block text-primary-200 mb-1">Precio</label>
                    <input type="number" step="0.01" {...register("precio")} className="input-field" placeholder="Precio" />
                </div>
                <div className="form-group flex items-center col-span-2">
                    <input type="checkbox" {...register("activo")} id="activo" className="w-5 h-5 accent-primary-300 mr-2" />
                    <label htmlFor="activo" className="text-primary-200">Activo</label>
                </div>
            </div>
            <button type="submit" className="btn-primary mt-8">Guardar</button>
        </form>
    );
};