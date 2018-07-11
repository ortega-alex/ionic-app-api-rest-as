import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { LoadingController } from 'ionic-angular';
import { Http } from '@angular/http';
import { Usuario, Plan } from '../../model/Usuario';
import 'rxjs/add/operator/map';
import { getMilisegundos } from '../../pipes/filtros/filtros';

@Injectable()
export class GlobalProvider {

  public usuario: Usuario;
  public plan: Plan;
  public data: any;
  private get_milisegundos = new getMilisegundos();
  public time: number;
  public token: any;

  constructor(
    public http: HttpClient,
    private strorage: Storage,
    private load: LoadingController,
    private htt: Http
  ) {
    this.getUsuario();
    this.htt.get('assets/utilitario.json').map(res => res.json()).subscribe(data => {
      this.data = data;
    });
  }

  setToken(token: any): void {
    this.strorage.set('token', token);
    this.getToken();
  }

  getToken() {
    this.strorage.get('token').then(token => {
      this.token = token;
    });
  }

  setUsuario(usuario: Usuario): void {
    this.strorage.set('usuario', usuario);
  }

  getUsuario() {
    this.strorage.get('usuario').then(usuario => {
      this.usuario = usuario;
    });
  }

  deleteUsuario() {
    this.strorage.remove('usuario');
  }

  setPlan(plan: Plan): void {
    this.strorage.set('plan', plan);
    this.getPlan();
  }

  getPlan() {
    this.strorage.get('plan').then(plan => {
      this.plan = plan;
    });
  }

  setFecha(date: Date) {
    this.strorage.set('fecha', this.get_milisegundos.transform(date));
  }

  setTime(time) {
    this.strorage.set('time', time);
    this.getTime();
  }

  getTime(): void {
    this.strorage.get('time').then(time => {
      this.time = time;
    });
  }

  setNum(num: number) {
    this.strorage.set('num', num);
  }

  deleteNum() {
    this.strorage.remove('num');
  }

  setListSms(nombre: string, list_sms: any): void {
    this.strorage.set(nombre, list_sms);
  }

  getListSms(nombre: string) {
    console.log(nombre);
    this.strorage.get(nombre).then(list_sms => {
      if (list_sms && list_sms != null) {
        return list_sms;
      }
      return false;
    });
  }

  deleteListSms(nombre: string) {
    this.strorage.remove(nombre);
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
}