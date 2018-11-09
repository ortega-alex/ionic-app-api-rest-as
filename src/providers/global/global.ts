import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Storage } from '@ionic/storage';
import { LoadingController, Platform, AlertController } from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
declare var SMS: any;
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';

import { Usuario, Plan } from '../../model/Usuario';
import { getMilisegundos, Fecha, Hora } from '../../pipes/filtros/filtros';
import { HttpProvider } from '../http/http';

export interface Idioma {
  key: string,
  contenido: Object
}

@Injectable()
export class GlobalProvider {

  public usuario: Usuario;
  public plan: Plan;
  public data: any;
  private get_milisegundos = new getMilisegundos();
  public time: number;
  public token: any;
  public dispositivo: boolean;
  public idioma: Idioma;
  public list_sms: Array<any>;
  private fecha = new Fecha();
  private hora = new Hora();

  constructor(
    public http: HttpClient,
    private storage: Storage,
    private load: LoadingController,
    private htt: Http,
    private platform: Platform,
    private httpProvider: HttpProvider,
    private facebook: Facebook,
    private alertController: AlertController
  ) {
    this.dispositivo = (this.platform.is('android')) ? true : false;
    this.getUsuario();
    this.getIdioma();
    this.htt.get('assets/utilitario.json').map(res => res.json()).subscribe(data => {
      this.data = data;
    });
  }

  setToken(token: any): void {
    this.storage.set('token', token);
    this.getToken();
  }

  getToken() {
    this.storage.get('token').then(token => {
      this.token = token;
    });
  }

  setUsuario(usuario: Usuario): void {
    this.storage.set('usuario', usuario);
  }

  getUsuario() {
    this.storage.get('usuario').then(usuario => {
      this.usuario = usuario;
    });
  }

  deleteUsuario() {
    this.storage.remove('usuario');
  }

  setPlan(plan: Plan): void {
    this.storage.set('plan', plan);
    this.getPlan();
  }

  getPlan() {
    this.storage.get('plan').then(plan => {
      this.plan = plan;
    });
  }

  setFecha(date: Date) {
    this.storage.set('fecha', this.get_milisegundos.transform(date));
  }

  setTime(time) {
    this.storage.set('time', time);
    this.getTime();
  }

  getTime(): void {
    this.storage.get('time').then(time => {
      this.time = time;
    });
  }

  setListSms(id: string, list_sms: any): void {
    this.list_sms = list_sms;
    this.storage.set(id, list_sms);
  }

  getListSms(id: string) {
    this.storage.get(id).then(list_sms => {
      this.list_sms = list_sms;
    });
  }

  deleteListSms(id: string) {
    this.storage.remove(id);
  }

  cargando(msj) {
    let loader = this.load.create({
      content: msj
    });
    loader.present();
    return loader;
  }

  alerta(msj) {
    let loader = this.load.create({
      content: msj
    });
    loader.present();
    setTimeout(() => {
      loader.dismiss();
    }, 3000);
  }

  getLenguajeUsuario(id: string) {
    return new Promise((resolve, reject) => {
      try {
        let url: string = this.httpProvider.URL + "servicio=getLenguajeUsuario&lg=" + id;
        this.http.get(url).subscribe((res: object) => {
          this.idioma = { key: id, contenido: res };
          this.storage.set("id", this.idioma)
          resolve();
        }, error => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  getIdioma() {
    this.storage.get("id").then((res: Idioma) => {
      if (res) {
        this.idioma = res;
      }
    });
  }

  setSMSRead(status: string, id: string) {
    let filter = {
      box: 'sent',
      body: this.list_sms[0].text
    };
    if (SMS) SMS.listSMS(filter, (list: Array<any>) => {
      this.list_sms.forEach((value, index) => {
        list.forEach((value2) => {
          if (value.telefono == value2.address) {
            this.list_sms[index].estado = "Y";
          }
        }, this);
      }, this);
      let url: string = this.httpProvider.URL + "servicio=setSMSConfirmacion";
      let data: Object = { id_campaniaSMS: id, id_usuario: this.usuario.id_usuario, sms: this.list_sms };
      this.http.post(url, JSON.stringify(data)).subscribe(() => {
        if (status == 'T') {
          this.deleteListSms(id);
        }
      }, (err) => console.log(err));
    }, Error => {
      console.log("err: " + JSON.stringify(Error))
    });
  }

  share() {
    var url: string;
    if (this.platform.is('android')) {
      url = 'https://advansalesapp.page.link/android';
    }
    if (this.platform.is('ios')) {
      url = 'https://advansalesapp.page.link/ios';
    }
    this.facebook.login(['email', 'public_profile']).then((response: FacebookLoginResponse) => {
      this.facebook.showDialog({
        method: "share",
        href: url,
        caption: '',
        description: '',
        picture: ''
      }).then(() => {
        let date = new Date();
        let url: string = 'servicio=setMostrarPublicidadUsuario' +
          '&id_usuario=' + this.usuario.id_usuario +
          '&fecha=' + this.fecha.transform(date) +
          '&hora=' + this.hora.transform(date) +
          '&lg=' + this.idioma.key;
        this.httpProvider.get(url).then((res: any) => {
          if (res.error == 'false') {
            let date = new Date(res.tiempo_usuario);
            this.setTime(this.get_milisegundos.transform(date));
            this.plan.gratis = res.gratis;
            this.plan.mostrar_publicidad_video = res.mostrar_publicidad_video;
            this.plan.mostrar_publicidad_banner = res.mostrar_publicidad_banner;
            this.plan.compartir_fb = res.compartir_fb;
            this.plan.plan = res.plan;
            this.plan.plan_fecha_expiracion = res.plan_fecha_expiracion;
            this.plan.plan_restriccion = res.plan_restriccion;
            this.plan.bloqueo = res.bloqueo;
            this.plan.bloqueo_msn = res.bloqueo_msn;
            this.plan.plan_restriccion_msn = res.plan_restriccion_msn;
            this.plan.suscrito = res.suscrito;
            this.setPlan(this.plan);
          }
        }).catch(err => console.log('err: ', err.toString()));
      }).catch(err => console.log('err', err.toString()));
    }).catch(err => console.log('err: ', err.toString()));
  }

  free() {
    if (this.plan.gratis == 'Y' && this.plan.compartir_fb == 'N') {
      let alert = this.alertController.create({
        title: '',
        subTitle: 'Make a publication so that the application is free!',
        buttons: ['Ok']
      });
      alert.present();
      return true;
    }
    return false;
  }

  bloqueo() {
    if (this.plan.bloqueo == 'Y') {
      let alert = this.alertController.create({
        title: '',
        subTitle: this.plan.bloqueo_msn,
        buttons: ['Ok']
      });
      alert.present();
      return true;
    }
    return false
  }

  validarTiempo() {
    let date = new Date().getTime();
    if ((!this.time || date >= this.time) && this.plan.mostrar_publicidad_video == 'Y') {
      let alert = this.alertController.create({
        title: '',
        subTitle: 'Get more time!',
        buttons: ['Ok']
      });
      alert.present();
      this.setBloqueoPublicidadUsuario('Y');
      return false;
    }
    return true;
  }

  setBloqueoPublicidadUsuario(tipo: string, fecha: string = null, hora: string = null, creditos: any = null) {
    let url: string = 'servicio=setBloqueoPublicidadUsuario' +
      '&bloqueo=' + tipo +
      '&id_usuario=' + this.usuario.id_usuario +
      '&fecha=' + fecha +
      '&hora=' + hora +
      '&creditos=' + creditos +
      '&lg=' + this.idioma.key;
    this.httpProvider.get(url).then((res: any) => {
      if (res.error == 'false') {
        let date = new Date(res.tiempo_usuario);
        this.setTime(this.get_milisegundos.transform(date));
      }
    }).catch(err => console.log('err: ', err.toString()));
  }
}