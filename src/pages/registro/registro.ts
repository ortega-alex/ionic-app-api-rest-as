import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { GlobalProvider } from '../../providers/global/global';
import { HttpProvider } from '../../providers/http/http';
import { Minusculas, isEmail } from '../../pipes/filtros/filtros';

import { LoginPage } from '../login/login';
import { Catalogo } from '../../model/interfaces';

@IonicPage()
@Component({
  selector: 'page-registro',
  templateUrl: 'registro.html',
})
export class RegistroPage {

  contador: number;
  catalogo: Array<Catalogo>;
  load: any;
  minusculas = new Minusculas();
  esImal = new isEmail();
  error: boolean;
  noValido: boolean;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public globalProvider: GlobalProvider,
    public httpProvider: HttpProvider
  ) {
    this.contador = 0;
    this.catalogo = [
      { label: 'Name', tipo: 'text', input: null, color: '#262626', ejemplo: 'e.g. John' },
      { label: 'Last Name', tipo: 'text', input: null, color: 'white', ejemplo: 'e.g. Smith' },
      { label: 'Email', tipo: 'emal', input: null, color: 'white', ejemplo: 'e.g. john@email.com' },
      { label: 'Password', tipo: 'password', input: null, color: 'white', ejemplo: 'e.g. Abc123**' },
      { label: 'Phone', tipo: 'text', input: null, color: 'white', ejemplo: 'e.g. 001-512-944-6475.' },
      { label: 'Nombre Completo', tipo: 'text', input: null, color: 'white', ejemplo: 'e.g. text' }
    ];
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
        if (this.contador == 4) {
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
    let platform = (this.globalProvider.dispositivo == true) ? 'android' : 'ios';
    this.load = this.globalProvider.cargando(this.globalProvider.data.msj.load);
    let url = 'servicio=setRegistroUsuario' +
      '&usuario=' + this.minusculas.transform(this.catalogo[2].input) +
      '&clave=' + this.catalogo[3].input +
      '&nombre=' + this.catalogo[0].input +
      '&apellido=' + this.catalogo[1].input +
      '&tipo_registro= R' +
      '&tipo_registro_id=' + null +
      '&token=' + this.globalProvider.token +
      '&plataforma=' + platform +
      '&telefono=' + this.catalogo[4].input +
      '&timezone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.httpProvider.get(url).then((res : any) => {
      this.load.dismiss();
      if (res.error == 'false') {
        this.globalProvider.alerta(res.msn);
        this.salir();
      } else {
        this.globalProvider.alerta(res.msn);
      }
    }).catch((err) => {
      this.load.dismiss();
      console.log('err: ' + JSON.stringify(err))
    });
  }
}