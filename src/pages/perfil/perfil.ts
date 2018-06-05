import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App, ViewController, Platform } from 'ionic-angular';

import { GlobalProvider } from '../../providers/global/global';
import { HttpProvider } from '../../providers/http/http';

import { MyApp } from '../../app/app.component';
import { Usuario } from '../../model/interfaces';
import { Minusculas } from '../../pipes/filtros/filtros';

@IonicPage()
@Component({
  selector: 'page-perfil',
  templateUrl: 'perfil.html',
})
export class PerfilPage {

  public submitted: boolean = false;
  private usuario: Usuario = {
    id_usuario: null,
    nombre: null,
    apellido: null,
    correo: null,
    imgUrl: null,
    clave: null,
    logIn: null,
    log_out: null,
    tipo_registro: null,
    tipo_usuario: null,
  };
  private load: any;
  private res: any;
  private minusculas = new Minusculas();
  private dispositivo: boolean;

  constructor(
    public navCtrl: NavController,
    private globalProvider: GlobalProvider,
    private app: App,
    public navParams: NavParams,
    public httpProvider: HttpProvider,
    private viewController: ViewController,
    private platform: Platform
  ) {
    this.dispositivo = this.platform.is('android');
    this.globalProvider.getUsuario();
  }

  ionViewDidLoad() {
    this.usuario = this.globalProvider.usuario;
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
      //this.globalProvider.deleteNum();
      this.menu();
    }
  }
}