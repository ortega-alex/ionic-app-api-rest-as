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
    public logIn: string;
    public log_out: string;
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
    public gratis: string;
    public mostrar_publicidad_video: string;
    public mostrar_publicidad_banner: string;
    public compartir_fb: string;
    public plan: string;
    public plan_fecha_expiracion: string;
    public plan_restriccion: string;
    public bloqueo: string;
    public bloqueo_msn: string;
    public plan_restriccion_msn: string;

    public activo: string;
    public leads: string;
    public sms_leads: string;
    public suscripcion_error_msn: string;
    public suscrito: string;
    public advanvcard: any;

    public leads_msn: string;
    public leads_sms_msn: string;
    public advansocial_msn: string;
    public advandocs_msn: string;
    public advanvcard_msn: string;

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
        advanvcard = null,
        leads_msn = null,
        leads_sms_msn = null,
        advansocial_msn = null,
        advandocs_msn = null,
        advanvcard_msn = null
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

        this.leads_msn = leads_msn;
        this.leads_sms_msn = leads_sms_msn;
        this.advansocial_msn = advansocial_msn;
        this.advandocs_msn = advandocs_msn;
        this.advanvcard_msn = advanvcard_msn;
    }
}