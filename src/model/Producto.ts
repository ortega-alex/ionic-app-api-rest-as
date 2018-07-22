/**
 * @author Alex Ortega
 */

 export class Producto{
    id_producto :string;
    titulo : string;
    descripcion : string;
    precio : string;  

    constructor(id_producto = null , titulo = null , descripcion = null , precio = null){
        this.id_producto = id_producto;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.precio = precio;
    }
 }