import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { LoadingController, Platform } from 'ionic-angular';
import { Http } from '@angular/http';
import { Usuario, Plan } from '../../model/Usuario';
import 'rxjs/add/operator/map';
import { getMilisegundos } from '../../pipes/filtros/filtros';
import { HttpProvider } from '../http/http';
declare var SMS: any;

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
  public list_sms: Array<any>

  constructor(
    public http: HttpClient,
    private storage: Storage,
    private load: LoadingController,
    private htt: Http,
    private platFrom: Platform,
    private httpProvider: HttpProvider
  ) {
    this.dispositivo = (this.platFrom.is('android')) ? true : false;
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
}