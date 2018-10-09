import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { LoadingController, Platform } from 'ionic-angular';
import { Http } from '@angular/http';
import { Usuario, Plan } from '../../model/Usuario';
import 'rxjs/add/operator/map';
import { getMilisegundos } from '../../pipes/filtros/filtros';
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

  constructor(
    public http: HttpClient,
    private storage: Storage,
    private load: LoadingController,
    private htt: Http,
    private platFrom: Platform,
    private httpProvider : HttpProvider
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

  setListSms(nombre: string, list_sms: any): void {
    this.storage.set(nombre, list_sms);
  }

  getListSms(nombre: string) {
    this.storage.get(nombre).then(list_sms => {
      if (list_sms && list_sms != null) {
        return list_sms;
      }
      return false;
    });
  }

  deleteListSms(nombre: string) {
    this.storage.remove(nombre);
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
}