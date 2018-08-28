/**
 * @author Alex ortega
 */

export class Usuario {
    public id_usuario: number;
    public nombre: string;
    public apellido: string;
    public correo: string;
    public imgUrl: string;
    public clave: string;
    public logIn: boolean;
    public log_out: boolean;
    public tipo_registro: string;
    public tipo_usuario: string;

    constructor(
        id_usuario = null,
        nombre = null,
        apellido = null,
        correo = null,
        imgUrl = null,
        clave = null,
        logIn = null,
        log_out = null,
        tipo_registro = null,
        tipo_usuario = null
    ) {
        this.id_usuario = id_usuario;
        this.nombre = nombre;
        this.apellido = apellido;
        this.correo = correo;
        this.imgUrl = imgUrl;
        this.clave = clave;
        this.logIn = logIn;
        this.log_out = log_out;
        this.tipo_registro = tipo_registro;
        this.tipo_usuario = tipo_usuario;
    }
}

export class Plan {
    public gratis: boolean; /* hasta que comparta en fb no podra realizar ningun tipo de accion */
    public mostrar_publicidad_video: boolean; /* y mostrar publicidad de video */
    public mostrar_publicidad_banner: boolean; /* y mostrar publiciodad de banner */
    public compartir_fb: boolean; /* compartir fb bandera */
    public plan: string; /* cutro planes A :  , B : , C :  , D :  */
    public plan_fecha_expiracion: string; /* fecha anio-mes-dia  */
    public plan_restriccion: boolean;  /*boton agregar list si esta en Y no se le muesta el +list*/
    public bloqueo: boolean; /* bloqueo de app */
    public bloqueo_msn: string; /* motivo del bloqueo */
    public plan_restriccion_msn: string;

    public activo: boolean;
    public leads: boolean;
    public sms_leads: boolean;
    public suscripcion_error_msn: string;
    public suscrito: boolean;
    public advanvcard: any;

    constructor(
        gratis = null,
        mostrar_publicidad_video = null,
        mostrar_publicidad_banner = null,
        compartir_fb = null,
        plan = null,
        plan_fecha_expiracion = null,
        plan_restriccion = null,
        bloqueo = null,
        bloqueo_msn = null,
        plan_restriccion_msn = null,
        suscrito = null,
        activo = null,
        leads = null,
        sms_leads = null,
        suscripcion_error_msn = null,
        advanvcard = null
    ) {
        this.gratis = gratis;
        this.mostrar_publicidad_video = mostrar_publicidad_video;
        this.mostrar_publicidad_banner = mostrar_publicidad_banner;
        this.compartir_fb = compartir_fb;
        this.plan = plan;
        this.plan_fecha_expiracion = plan_fecha_expiracion;
        this.plan_restriccion = plan_restriccion;
        this.bloqueo = bloqueo;
        this.bloqueo_msn = bloqueo_msn;
        this.plan_restriccion_msn = plan_restriccion_msn;
        this.suscrito = suscrito;
        this.activo = activo;
        this.leads = leads;
        this.sms_leads = sms_leads;
        this.suscripcion_error_msn = suscripcion_error_msn;
        this.advanvcard = advanvcard;
    }
}