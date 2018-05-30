import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CampaniaPage } from './campania';

@NgModule({
  declarations: [
    CampaniaPage,
  ],
  imports: [
    IonicPageModule.forChild(CampaniaPage),
  ],
})
export class CampaniaPageModule {}
