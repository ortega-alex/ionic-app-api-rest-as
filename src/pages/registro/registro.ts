import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';

import { GlobalProvider } from '../../providers/global/global';
import { HttpProvider } from '../../providers/http/http';
import { Minusculas, isEmail } from '../../pipes/filtros/filtros';

import { LoginPage } from '../login/login';

@IonicPage()
@Component({
  selector: 'page-registro',
  templateUrl: 'registro.html',
})
export class RegistroPage {

  private contador: number = 0;
  private catalogo = [
    { label: 'Name', typtipoe: 'text', input: null, color: '#262626', ejemplo: 'e.g. John' },
    { label: 'Last Name', tipo: 'text', input: null, color: 'white', ejemplo: 'e.g. Smith' },
    { label: 'Email', tipo: 'emal', input: null, color: 'white', ejemplo: 'e.g. john@email.com' },
    { label: 'Password', tipo: 'password', input: null, color: 'white', ejemplo: 'e.g. Abc123**' },
    { label: 'Nombre Completo', tipo: 'text', input: null, color: 'white', ejemplo: 'e.g. text' }
  ];
  private load: any;
  private minusculas = new Minusculas();
  private esImal = new isEmail();
  private res: any;
  private error: boolean;
  private noValido: boolean;
  private dispositivo: boolean;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public globalProvider: GlobalProvider,
    public httpProvider: HttpProvider,
    private platform: Platform
  ) {
    this.dispositivo = this.platform.is('android');
  }

  ionViewDidLoad() { }

  salir() {
    this.navCtrl.push(LoginPage);
  }

  retroceder() {
    if (this.contador == 0) {
      this.salir();
    } else {
      this.catalogo[this.contador].color = 'white';
      this.contador--;
    }
  }

  siguente() {
    if (this.catalogo[this.contador].input == null || this.catalogo[this.contador].input.trim() == '') {
      this.error = true;
    } else {
      if (this.contador == 2 && !this.esImal.transform(this.catalogo[this.contador].input)) {
        this.error = true;
        this.noValido = true;
      } else {
        if (this.contador == 3) {
          this.guardarRegistro();
        } else {
          this.contador++;
          this.catalogo[this.contador].color = '#262626';
        }
      }
    }
  }

  escribiendo() {
    if (this.catalogo[this.contador].input != null) {
      this.error = false;
      this.noValido = false;
    }
  }

  guardarRegistro() {
    let platform = (this.platform.is('ios')) ? 'ios' : 'android';
    this.load = this.globalProvider.cargando(this.globalProvider.data.msj.load);
    let url = 'servicio=setRegistroUsuario' +
      '&usuario=' + this.minusculas.transform(this.catalogo[2].input) +
      '&clave=' + this.catalogo[3].input +
      '&nombre=' + this.catalogo[0].input +
      '&apellido=' + this.catalogo[1].input +
      '&tipo_registro= R' +
      '&tipo_registro_id' + null +
      '&token=' + this.globalProvider.token +
      '&plataforma=' + platform;
    this.httpProvider.get(url).then(res => {
      this.load.dismiss();
      this.res = res;
      if (this.res.error == 'false') {
        this.globalProvider.alerta(this.res.msn);
        this.salir();
      } else {
        this.globalProvider.alerta(this.res.msn);
      }
    }).catch(err => console.log('err: ' + JSON.stringify(err)));
  }
}