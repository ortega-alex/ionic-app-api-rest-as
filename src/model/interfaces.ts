export interface Usuario {
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
};

export interface CallLogObject {
	name: string;
	value: string | Array<string>;
	operator: '==' | '!=' | '>' | '>=' | '<' | '<=' | 'like';
};

export interface Plan {
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
};

//campania
export interface Detalle {
	notas: string;
	otroTelefono: string;
	date: string;
	sms: string;
};

export interface Stados {
	border: string;
};

//crear campania
export interface Campos {
	edit_uno: string;
	uno: string;
	uno_stado: boolean;
	edit_dos: string;
	dos: string;
	dos_stado: boolean;
};

export interface Campania {
	id_campania_manual: number;
	nombre_campania: string;
	telefono: string;
	nombre: string;
	fecha: string;
	sms: boolean;
	sms_tex: string;
	nota: string;
	stado: number;
	campos: Campos;
};

export interface Stado {
	cambio: boolean;
	stado: Array<boolean>;
};

//home
export interface Persona {
	edit: boolean;
	border: string;
	border_stado: Array<any>;
	posicion_campania: number;
	stado: Array<any>
};

export interface Estados {
	color: number;
	id: number;
	valor: number;
	texto: string;
};

export interface CampaniaSms {
	id_campania: number;
	nombre: string;
	tipo_campania: number;
	estados: Array<Estados>;
	togglel: boolean;
};

export interface HomeUtil {
	compartir: boolean;
	title: string;
	spinner: boolean;
	background: string;
	dispositivo: boolean;
};

//registro
export interface Catalogo {
	label: string;
	tipo: string;
	input: string;
	color: string;
	ejemplo: string;
};

//sms 
export interface Telefono {
	telefono: string;
	text: string;
}

export interface Stado_sms {
	sms: Array<Telefono>;
	id: number;
	inicio: number;
	hilo: any;
	estado: string
}

//perfil
export interface Imagenes {
	url: string;
};

export interface Tutorial {
	nombre: string;
	imagenes: Array<Imagenes>;
};

//modal 
export interface DataModal {
	view: number;
	num: number;
	imagenes: Array<Imagenes>
};

export interface Util {
	submitted: boolean;
	error: boolean;
	noValido: boolean;
	dispositivo: boolean;
	mostrar: boolean;
	msnS: boolean;
	catalogoEstado: Array<any>;
	nombre_archivo: string;
	sms_tex: string;
	style: { background: string, opacity: string };
	panel_llamada: boolean;
};