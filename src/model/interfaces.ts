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
}

export interface CallLogObject {
	name: string;
	value: string | Array<string>;
	operator: '==' | '!=' | '>' | '>=' | '<' | '<=' | 'like';
}

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
} 