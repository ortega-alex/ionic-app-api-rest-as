import { NgModule } from '@angular/core';
import { Mayusculas, Minusculas, isEmail, Numerico, Replace, Fechas, Fecha, Hora, getMilisegundos, setMilisegundos, FechaAnterior,FechaPosterios, SetTimeDate, Diferencia } from './filtros/filtros';
@NgModule({
	declarations: [Mayusculas, Minusculas, isEmail, Numerico, Replace, Fechas, Fecha, Hora, getMilisegundos, setMilisegundos, FechaAnterior, FechaPosterios,SetTimeDate, Diferencia],
	imports: [],
	exports: [Mayusculas, Minusculas, isEmail, Numerico, Replace, Fechas, Fecha, Hora, getMilisegundos, setMilisegundos, FechaAnterior,FechaPosterios, SetTimeDate, Diferencia]
})
export class PipesModule { }

