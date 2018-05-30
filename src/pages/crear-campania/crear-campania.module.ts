import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CrearCampaniaPage } from './crear-campania';

@NgModule({
  declarations: [
    CrearCampaniaPage,
  ],
  imports: [
    IonicPageModule.forChild(CrearCampaniaPage),
  ],
})
export class CrearCampaniaPageModule {}
