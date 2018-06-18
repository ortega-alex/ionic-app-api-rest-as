import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ViewController, AlertController, ModalController } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';

import { GlobalProvider } from '../../providers/global/global';
import { HttpProvider } from '../../providers/http/http';
import { Fecha, Hora, Numerico } from '../../pipes/filtros/filtros';

import { SMS } from '@ionic-native/sms';
import { Stado_sms } from '../../model/interfaces';

@IonicPage()
@Component({
  selector: 'page-sms',
  templateUrl: 'sms.html',
})
export class SmsPage {

  private historial: boolean;
  private campania_sms: Array<any> = [];
  private res: any;
  private sms_from: FormGroup;
  private fecha = new Fecha();
  private hora = new Hora();
  private campaniaSMS: Array<any> = [];
  private sms_status: Array<{ togglel: boolean }> = [];
  private numerico = new Numerico();
  private stado_sms: Stado_sms;
  private id: number;
  private dispositivo: boolean;
  private load : any;
  private submitted: boolean = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private platform: Platform,
    private viewController: ViewController,
    private globalProvider: GlobalProvider,
    private httpProvider: HttpProvider,
    private formBuilder: FormBuilder,
    private alertController: AlertController,
    private modalController: ModalController,
    private sms: SMS
  ) {
    this.dispositivo = this.platform.is('android');
    this.historial = this.navParams.get('historial');
    this.campania_sms = this.navParams.get('campania_sms');
    if (this.historial == false) {
      this.sms_from = this.formBuilder.group({
        sms_text: ['', Validators.required],
        nombre: ['', Validators.required],
        fecha: ['']
      });
    } else {
      this.id = this.navParams.get('id');
      this.getCampaniaSMSUsuario(this.id);
    }
  }

  ionViewDidLoad() {
    this.platform.registerBackButtonAction(() => {
      this.closeModal(true);
    });
  }

  ionViewWillUnload() {
    this.platform.registerBackButtonAction(() => {
      this.platform.exitApp();
    });
  }

  closeModal(data: boolean = false): void {
    this.viewController.dismiss(data);
  }

  setCampaniaSMSUsuario(): void {
    this.submitted = true;
    if (this.sms_from.valid) {
      this.load = this.globalProvider.cargando(this.globalProvider.data.msj.load);
      var fecha: string;
      var hora: string;
      var fecha_dispositivo = new Date();
      if (this.sms_from.value.fecha != null && this.sms_from.value.fecha != '') {
        fecha = this.sms_from.value.fecha.substr(0, 10);
        hora = this.sms_from.value.fecha.substr(11, 5);
      } else {
        fecha = this.fecha.transform(fecha_dispositivo);
        hora = this.hora.transform(fecha_dispositivo);
      }
      let url = "servicio=setCampaniaSMSUsuario";
      let data = {
        id_usuario: this.globalProvider.usuario.id_usuario,
        nombre: this.sms_from.value.nombre,
        mensaje: this.sms_from.value.sms_text,
        fecha_dispositivo: this.fecha.transform(fecha_dispositivo),
        hora_dispositivo: this.hora.transform(fecha_dispositivo),
        fecha: fecha,
        hora: hora,
        campaniaSms: this.campania_sms
      };
      this.httpProvider.post(data, url).then(res => {
        this.load.dismiss();
        this.res = res;
        if (this.res.error == 'false') {
          this.historial = true;
          if (this.res.crear_recordatorio == 'N') {
            this.getListaSMSCampaniaSMS(this.res.id, true);
          } else {
            this.getListaSMSCampaniaSMS(this.res.id);
          }
          this.getCampaniaSMSUsuario();
        } else {
          this.globalProvider.alerta(this.res.msn);
        }
      }).catch(err => {
        this.load.dismiss();
        console.log('err: ' + JSON.stringify(err));        
      });
    }
  }

  togglel(i: number = null): void {
    this.sms_status.forEach(function (value, index) {
      if (value.togglel == true && index != i) {
        value.togglel = false;
      }
    });
    if (i != null) {
      this.sms_status[i].togglel = !this.sms_status[i].togglel;
    }
  }

  getCampaniaSMSUsuario(id: number = null) {
    let url = "servicio=getCampaniaSMSUsuario&id_usuario=" + this.globalProvider.usuario.id_usuario;
    this.httpProvider.get(url).then(res => {
      this.res = res;
      if (this.res.error == 'false') {
        for (let i = 0; i < this.res.campaniaSMS.length; i++) {
          if (id != null && this.res.campaniaSMS[i].id_campania_sms == id) {
            this.sms_status.push({ togglel: true });
          } else {
            this.sms_status.push({ togglel: false });
          }
        }
        this.campaniaSMS = this.res.campaniaSMS;
      }
    }).catch(err => console.log('err: ' + JSON.stringify(err)));
  }

  setDeleteCampaniaSMS(id: number) {
    let confirm = this.alertController.create({
      title: '',
      message: this.globalProvider.data.msj.warning,
      buttons: [
        {
          text: 'No',
          handler: () => { }
        },
        {
          text: 'Yes',
          handler: () => {
            this.globalProvider.deleteListSms(id.toString());
            let url = "servicio=setDeleteCampaniaSMS&id_campaniaSMS=" + id;
            this.httpProvider.get(url).then(res => {
              this.res = res;
              if (this.res.error == 'false') {
                this.globalProvider.alerta(this.res.msn);
                this.togglel();
                this.getCampaniaSMSUsuario();
              } else {
                this.globalProvider.alerta(this.res.msn);
              }
            }).catch(err => console.log('err: ' + JSON.stringify(err)));
          }
        }
      ]
    });
    confirm.present();
  }

  porcentage(min: number, max: number) {
    let porcentage: any;
    if (max != null && min != null) {
      porcentage = Math.round(((min * 100) / max));
    } else {
      porcentage = min * 10;
    }
    return porcentage;
  }

  getListaSMSCampaniaSMS(id: number, empesar: boolean = false, inicio: number = 0) {
    let url = "servicio=getListaSMSCampaniaSMS&id_campaniaSMS=" + id;
    this.httpProvider.get(url).then(res => {
      this.res = res;
      if (this.res.error == 'false') {
        this.globalProvider.setListSms(id.toString(), this.res.sms);
        if (empesar == true) {
          this.stado_sms = { sms: this.res.sms, id: id, inicio: inicio, hilo: null, estado: '' };
          if (this.dispositivo == true) {
            this.play();
          } else {
            this.setSms(this.res.sms, id, inicio);
          }
        }
      }
    }).catch(err => console.log('err: ' + JSON.stringify(err)));
  }

  setSms(list_sms: Array<{ telefono: string, text: string }>, id: number, inicio: number) {
    this.sms.send(this.numerico.transform(list_sms[inicio].telefono), list_sms[inicio].text).then(res => {
      this.setSMSEnviadoCampanaSMS(id);
      if (list_sms.length - 1 == inicio) {
        this.setEstadoCampaniaSMS(id, 'T');
        this.stado_sms.estado = 'T';
        this.getCampaniaSMSUsuario();
        if (this.dispositivo == true) {
          clearInterval(this.stado_sms.hilo);
        }
        this.closeModal(true);
        return false;
      }
      if (this.dispositivo == true) {
        this.stado_sms.inicio++;
        if (this.stado_sms.estado != 'A') {
          this.setEstadoCampaniaSMS(id, 'A');
          this.stado_sms.estado = 'A';
          this.getCampaniaSMSUsuario();
        }
      } else {
        let data = { view: 3, num: null }
        let modal = this.modalController.create('ModalPage', { data: data });
        modal.present();
        modal.onDidDismiss(data => {
          if (data == true) {
            inicio++;
            this.setEstadoCampaniaSMS(id, 'A');
            this.setSms(list_sms, id, inicio);
          } else {
            this.setEstadoCampaniaSMS(id, 'P');
            this.closeModal(true);
            return false;
          }
        });
      }
    }).catch(err => {
      //(this.dispositivo == true) ? this.pausar() : console.log('err: ' + JSON.stringify(err));
      console.log('err: ' + JSON.stringify(err));
    });
  }

  setSMSEnviadoCampanaSMS(id: number) {
    let url = "servicio=setSMSEnviadoCampanaSMS&id_campaniaSMS=" + id;
    this.httpProvider.get(url).then(res => {
      this.res = res;
    }).catch(err => console.log('err: ' + JSON.stringify(err)));
  }

  setEstadoCampaniaSMS(id: number, stado: string) {
    let url = "servicio=setEstadoCampaniaSMS" +
      "&id_campaniaSMS=" + id +
      "&estado=" + stado;
    this.httpProvider.get(url).then(res => {
      this.res = res;
    }).catch(err => console.log('err: ' + JSON.stringify(err)));
    if (stado == 'P') {
      this.getCampaniaSMSUsuario();
    }
  }

  getSMSTotalEnviado(id: number, i: number) {
    this.campaniaSMS[i].estado_campania_sms = 'A';
    let url = "servicio=getSMSTotalEnviado&id_campaniaSMS=" + id;
    this.httpProvider.get(url).then(res => {
      this.res = res;
      if (this.res.error == 'false') {
        this.getListaSMSCampaniaSMS(id, true, this.res.sms_enviado);
      }
    }).catch(err => console.log('err: ' + JSON.stringify(err)));
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.getCampaniaSMSUsuario();
      refresher.complete();
    });
  }

  play() {
    this.stado_sms.hilo = setInterval(() => {
      this.setSms(this.stado_sms.sms, this.stado_sms.id, this.stado_sms.inicio);
    }, 8000);
  }

  pausar(i: number) {
    this.campaniaSMS[i].estado_campania_sms = 'P';
    clearInterval(this.stado_sms.hilo);
    this.setEstadoCampaniaSMS(this.stado_sms.id, 'P');
  }
}