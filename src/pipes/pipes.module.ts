import { NgModule } from '@angular/core';
import { Mayusculas, Minusculas, isEmail, Numerico, Replace, Fechas, Fecha, Hora, getMilisegundos, setMilisegundos, FechaAnterior,FechaPosterios, SetTimeDate, Diferencia } from './filtros/filtros';
import { TranslatePipe } from './translate/translate';
@NgModule({
	declarations: [Mayusculas, Minusculas, isEmail, Numerico, Replace, Fechas, Fecha, Hora, getMilisegundos, setMilisegundos, FechaAnterior, FechaPosterios,SetTimeDate, Diferencia,
    TranslatePipe],
	imports: [],
	exports: [Mayusculas, Minusculas, isEmail, Numerico, Replace, Fechas, Fecha, Hora, getMilisegundos, setMilisegundos, FechaAnterior,FechaPosterios, SetTimeDate, Diferencia,
    TranslatePipe]
})
export class PipesModule { }

