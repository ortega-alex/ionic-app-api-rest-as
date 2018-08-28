import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App, ViewController, Platform, ModalController } from 'ionic-angular';

import { GlobalProvider } from '../../providers/global/global';
import { HttpProvider } from '../../providers/http/http';

import { MyApp } from '../../app/app.component';
import { Tutorial, Imagenes } from '../../model/interfaces';
import { VcardPage } from '../vcard/vcard';

//import { SocialSharing } from '@ionic-native/social-sharing';

@IonicPage()
@Component({
  selector: 'page-perfil',
  templateUrl: 'perfil.html',
})
export class PerfilPage {

  res: any;
  submitted: boolean;
  dispositivo: boolean;
  tutoriales: Array<Tutorial>;
  //private vcard: any;

  constructor(
    public navCtrl: NavController,
    private globalProvider: GlobalProvider,
    private app: App,
    public navParams: NavParams,
    public httpProvider: HttpProvider,
    private viewController: ViewController,
    private platform: Platform,
    private modalController: ModalController,
    //private socialSharing: SocialSharing
  ) {
    this.dispositivo = this.platform.is('android');
    this.globalProvider.getUsuario();
    //this.vcard = this.navParams.get('vcard');
    this.tutoriales = [];   
    this.submitted = false; 
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
      this.globalProvider.getUsuario();
      this.menu();
    }
  }

  getTutorialPlateforma() {
    var dispositivo = (this.dispositivo == true) ? 'android' : 'ios';
    let url = 'servicio=getTutorialPlateforma&plataforma=' + dispositivo;
    this.httpProvider.get(url).then(res => {
      this.res = res;
      this.tutoriales = this.res.tutorial;
    }).catch(err => console.log('err: ' + JSON.stringify(err)));
  }

  demo(imagenes: Array<Imagenes>) {
    let data: { view: number, num: number, imagenes: Array<Imagenes> } = { view: 2, num: null, imagenes: imagenes };
    let modal = this.modalController.create('ModalPage', { data: data });
    modal.present();
  }

  paquetes() {
    let data: { view: number, num: number, imagenes: Array<Imagenes> } = { view: 5, num: null, imagenes: null };
    let modal = this.modalController.create('ModalPage', { data: data });
    modal.present();
  }

  /*getImg(url: string) {
    return this.httpProvider.img + url;
  }*/

  /*compartir(url: string) {
      this.socialSharing.share(url).then(() => {
        console.log('success: ')
      }).catch(err => alert('err: ' + JSON.stringify(err)));    
  }*/

  /*nada() {
    console.log(this.vcard , this.tutoriales);
  }*/

  vcard() {
    this.navCtrl.push(VcardPage);
  }

}