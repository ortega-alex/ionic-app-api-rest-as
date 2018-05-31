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
    login: false,
    imgUrl: null,
    clave: null,
    tipo: null,
    gratis: null,
    mostrar_publicidad_video: null,
    mostrar_publicidad_banner: null,
    compartir_fb: null
  };
  private load: any;
  private res: any;
  private mostrar: boolean;
  private minusculas = new Minusculas();

  constructor(
    public navCtrl: NavController,
    private globalProvider: GlobalProvider,
    private app: App,
    public navParams: NavParams,
    public httpProvider: HttpProvider,
    private viewController: ViewController,
    private platform: Platform
  ) {
    this.globalProvider.getUsuario();
  }

  ionViewDidLoad() {
    this.cargarDatosUsuario();
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

  cargarDatosUsuario() {
    this.usuario = this.globalProvider.usuario;
    this.mostrar = true;
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
}