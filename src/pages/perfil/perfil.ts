import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App, ViewController, Platform, ModalController } from 'ionic-angular';

import { GlobalProvider } from '../../providers/global/global';
import { HttpProvider } from '../../providers/http/http';

import { MyApp } from '../../app/app.component';
import { Tutorial, Imagenes } from '../../model/interfaces';

@IonicPage()
@Component({
  selector: 'page-perfil',
  templateUrl: 'perfil.html',
})
export class PerfilPage {

  tutoriales: Array<Tutorial>;

  constructor(
    public navCtrl: NavController,
    private globalProvider: GlobalProvider,
    private app: App,
    public navParams: NavParams,
    public httpProvider: HttpProvider,
    private viewController: ViewController,
    private platform: Platform,
    private modalController: ModalController
  ) {
    this.tutoriales = [];
  }

  ionViewDidLoad() {
    this.getTutorialPlateforma();
    this.platform.registerBackButtonAction(() => {
      this.closeModal();
    });
  }

  ionViewWillUnload() {
    this.platform.registerBackButtonAction(() => {
      this.platform.exitApp();
    });
  }

  closeModal() {
    this.viewController.dismiss();
  }

  menu() {
    this.app.getRootNav().setRoot(MyApp);
  }

  cerrarSesion() {
    if (this.globalProvider.usuario) {
      this.globalProvider.deleteUsuario();
      this.menu();
    }
  }

  getTutorialPlateforma() {
    var dispositivo = (this.globalProvider.dispositivo == true) ? 'android' : 'ios';
    let url = 'servicio=getTutorialPlateforma&plataforma=' + dispositivo;
    this.httpProvider.get(url).then((res: any) => {
      this.tutoriales = res.tutorial;
    }).catch(err => console.log('err: ' + JSON.stringify(err)));
  }

  demo(imagenes: Array<Imagenes>) {
    let data: { view: number, num: number, imagenes: Array<Imagenes> } = { view: 2, num: null, imagenes: imagenes };
    let modal = this.modalController.create('ModalPage', { data: data });
    modal.present();
  }
}