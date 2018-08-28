/**
 * @author Alex ortega
 */

export class Vcard {
    public error: string;
    public msn: string;
    public id_usuario: string;
    public nombre: string;
    public apellido: string;
    public clave : string;
    public id_vcard_usuario : string;
    public url_instagram: string;
    public url_facebook: string;
    public url_twitter: string;
    public usuario_presentacion: string;
    public profesion: string;
    public organisacion: string;
    public ruta_img: string;
    public ruta_logo: string;
    public url_vcard: string;
    //public id_vcard_configuracion: string;
    public tamanio: string;
    public italic: string;
    public bold: string;
    public subrayar: string;
    public fondo: string;
    public text_color: string;
    public btn_color: string;
    public telefonos: Array<{
        id_vcard_telefono: string,
        telefono: string,
        tipo: string,
    }>;

    constructor(
        error = null,
        msn = null,
        id_usuario = null,
        nombre = null,
        apellido = null,
        clave = null,
        id_vcard_usuario = null ,
        url_instagram = null,
        url_facebook = null,
        url_twitter = null,
        usuario_presentacion = null,
        profesion = null,
        organisacion = null,
        ruta_img = null,
        ruta_logo = null,
        url_vcard = null,
        //id_vcard_configuracion = null,
        tamanio = null,
        italic = null,
        bold = null,
        subrayar = null,
        fondo = null,
        text_color = null,
        btn_color = null,
        telefonos = []
    ) {
        this.error = error;
        this.msn = msn;
        this.id_usuario = id_usuario;
        this.nombre = nombre;
        this.apellido = apellido;
        this.clave = clave;
        this.id_vcard_usuario = id_vcard_usuario;
        this.url_instagram = url_instagram;
        this.url_facebook = url_facebook;
        this.url_twitter = url_twitter;
        this.usuario_presentacion = usuario_presentacion;
        this.profesion = profesion;
        this.organisacion = organisacion;
        this.ruta_img = ruta_img;
        this.ruta_logo = ruta_logo;
        this.url_vcard = url_vcard;
        //this.id_vcard_configuracion = id_vcard_configuracion;
        this.tamanio = tamanio;
        this.italic = italic;
        this.bold = bold;
        this.subrayar = subrayar;
        this.fondo = fondo;
        this.text_color = text_color;
        this.btn_color = btn_color;
        this.telefonos = telefonos;
    }
}