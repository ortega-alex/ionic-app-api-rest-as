/**
 * @author Alex ortega
 */

 export class Usuario{
    id_usuario: number;
	nombre: string;
	apellido: string;
	correo: string;
	imgUrl: string;
	clave: string;
	logIn: boolean;
	log_out: boolean;
	tipo_registro: string;
    tipo_usuario: string;
    
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
    ){
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
    gratis: boolean; /* hasta que comparta en fb no podra realizar ningun tipo de accion */
	mostrar_publicidad_video: boolean; /* y mostrar publicidad de video */
	mostrar_publicidad_banner: boolean; /* y mostrar publiciodad de banner */
	compartir_fb: boolean; /* compartir fb bandera */
	plan: string; /* cutro planes A :  , B : , C :  , D :  */
	plan_fecha_expiracion: string; /* fecha anio-mes-dia  */
	plan_restriccion: boolean;  /*boton agregar list si esta en Y no se le muesta el +list*/
	bloqueo: boolean; /* bloqueo de app */
	bloqueo_msn: string; /* motivo del bloqueo */
    plan_restriccion_msn: string;
    
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
        plan_restriccion_msn = null
    ){ 
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
    }
 }