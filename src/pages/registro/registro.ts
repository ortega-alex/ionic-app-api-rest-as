import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App } from 'ionic-angular';

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
  idiomas: Array<any>;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public globalProvider: GlobalProvider,
    public httpProvider: HttpProvider,
    private app: App
  ) {
    this.idiomas = [];
    this.getCatalogoLenguaje();
    this.contador = 0;
    this.catalogo = [
      { label: '_language', tipo: 'selected', input: "en", color: '#262626', ejemplo: null },
      { label: '_name', tipo: 'text', input: null, color: 'white', ejemplo: '_egName' },
      { label: '_lastName', tipo: 'text', input: null, color: 'white', ejemplo: '_egLastName' },
      { label: '_email', tipo: 'emal', input: null, color: 'white', ejemplo: '_egEmail' },
      { label: '_password', tipo: 'password', input: null, color: 'white', ejemplo: '_egPassword' },
      { label: '_phone', tipo: 'text', input: null, color: 'white', ejemplo: '_egPhone' },
      { label: null, tipo: 'text', input: null, color: 'white', ejemplo: null }
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
      if (this.contador == 3 && !this.esImal.transform(this.catalogo[this.contador].input)) {
        this.error = true;
        this.noValido = true;
      } else {
        if (this.contador == 5) {
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
    let url: string = "servicio=setRegistroUsuarioJ";
    let data: Object = {
      usuario: this.minusculas.transform(this.catalogo[3].input),
      clave: this.catalogo[4].input,
      nombre: this.catalogo[1].input,
      apellido: this.catalogo[2].input,
      tipo_registro: 'R',
      tipo_registro_id: null,
      token: this.globalProvider.token,
      plataforma: platform,
      telefono: this.catalogo[5].input,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      lg: this.globalProvider.idioma.key
    };
    this.httpProvider.post(data, url).then((res: any) => {
      this.load.dismiss();
      if (res.error == 'false') {
        this.globalProvider.alerta(res.msn);
        this.salir();
      } else {
        this.globalProvider.alerta(res.msn);
      }
    }).catch((err) => {
      this.load.dismiss();
      console.log('err: ', err.toString())
    });
  }

  getLenguajeUsuario(id: string) {
    this.globalProvider.getLenguajeUsuario(id).then(() => {
      this.app.getRootNav().setRoot(RegistroPage);
    }).catch(err => console.log('err idioma: ' + err.toString()));
  }

  getCatalogoLenguaje() {
    let url: string = "servicio=getCatalogoLenguaje&lg=" + this.globalProvider.idioma.key;
    this.httpProvider.get(url).then((res: Array<any>) => {
      this.idiomas = res;
    }).catch(err => console.log('err: ' + err.toString()));
  }
}