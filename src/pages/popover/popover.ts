import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { GlobalProvider } from '../../providers/global/global';

@IonicPage()
@Component({
  selector: 'page-popover',
  templateUrl: 'popover.html',
})
export class PopoverPage {

  private title: string;
  private informacion: string;
  private posicion: number;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private globalProvider: GlobalProvider,
    private viewController: ViewController
  ) {
    this.posicion = this.navParams.get('posicion');
    this.title = this.globalProvider.data.info[this.posicion].title;
    if (this.posicion == 0) {
      let i = this.globalProvider.data.info[this.posicion].msj;
      this.informacion = i.split('#');
    } else {
      this.informacion = this.globalProvider.data.info[this.posicion].msj;
    }
  }

  ionViewDidLoad() {
    console.log(this.title + ' ' + this.informacion);
  }

  closeModal() {
    this.viewController.dismiss();
  }
}