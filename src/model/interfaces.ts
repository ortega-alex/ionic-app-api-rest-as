export interface CallLogObject {
	name: string;
	value: string | Array<string>;
	operator: '==' | '!=' | '>' | '>=' | '<' | '<=' | 'like';
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
	id : string;
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

export interface Util {
	submitted: boolean;
	error: boolean;
	noValido: boolean;
	mostrar: boolean;
	msnS: boolean;
	catalogoEstado: Array<any>;
	nombre_archivo: string;
	sms_tex: string;
	panel_llamada: boolean;
};