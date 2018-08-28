import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VcardPage } from './vcard';

@NgModule({
  declarations: [
    VcardPage,
  ],
  imports: [
    IonicPageModule.forChild(VcardPage),
  ],
})
export class VcardPageModule {}
