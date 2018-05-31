export interface Usuario {
	id_usuario: number;
	nombre: string;
	apellido: string;
	correo: string;
	login: boolean;
	imgUrl: string;
	clave: string;
	tipo: string;
	gratis: string;
	mostrar_publicidad_video: string;
	mostrar_publicidad_banner: string;
	compartir_fb: string;
}

export interface CallLogObject {
	name: string;
	value: string | Array<string>;
	operator: '==' | '!=' | '>' | '>=' | '<' | '<=' | 'like';
}