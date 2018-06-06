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

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private globalProvider: GlobalProvider,
    private viewController: ViewController
  ) {
    this.informacion = this.globalProvider.data.info[this.navParams.get('posicion')].msj;
    this.title = this.globalProvider.data.info[this.navParams.get('posicion')].title;
  }

  ionViewDidLoad() { }

  closeModal() {
    this.viewController.dismiss();
  }
}