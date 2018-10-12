import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ViewController, ModalController } from 'ionic-angular';
import { GlobalProvider } from '../../providers/global/global';
import { HttpProvider } from '../../providers/http/http';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Hora, Fecha, Numerico } from '../../pipes/filtros/filtros';
import { SMS } from '@ionic-native/sms';


@IonicPage()
@Component({
  selector: 'page-sms',
  templateUrl: 'sms.html',
})
export class SmsPage {

  sms_page: number;
  sms_status: Array<{ togglel: boolean }>;
  campaniaSMS: Array<any>;
  load: any;
  visitas: Array<any>;
  submitted: boolean;
  sms_from: FormGroup;
  hora = new Hora();
  fecha = new Fecha();
  campania_sms: Array<any>;
  hilo: any;
  numerico = new Numerico();
  list: { id: number, sms_enviado: number, status: string, posicion: number };

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private platform: Platform,
    private viewController: ViewController,
    private globalProvider: GlobalProvider,
    private httpProvider: HttpProvider,
    private formBuilder: FormBuilder,
    private sms: SMS,
    private modalController: ModalController
  ) {
    this.sms_page = (this.navParams.get('historial') == true) ? 1 : 0;
    if (this.sms_page == 1) {
      this.getCampaniaSMSUsuario(this.navParams.get('id'));
    }
    if (this.sms_page == 0) {
      this.campania_sms = this.navParams.get('campania_sms');
      this.sms_from = this.formBuilder.group({
        link_redirect: [''],
        sms_text: ['', Validators.required],
        nombre: ['', Validators.required],
        hora: [this.hora.transform(new Date()), Validators.required],
        fecha: [this.fecha.transform(new Date()), Validators.required]
      });
    }
    this.sms_status = [];
    this.campaniaSMS = [];
    this.submitted = false;
  }

  ionViewDidLoad() {
    this.platform.registerBackButtonAction(() => {
      this.closeModal(true);
    });
  }

  ionViewWillUnload() {
    this.platform.registerBackButtonAction(() => {
      this.closeModal(true);
    });
  }

  closeModal(data: boolean = false): void {
    if (this.sms_page == 2) {
      this.sms_page = 1
      return
    }
    this.viewController.dismiss(data);
  }

  getCampaniaSMSUsuario(id: number = null) {
    let url: string = "servicio=getCampaniaSMSUsuario&id_usuario=" + this.globalProvider.usuario.id_usuario +
      "&lg=" + this.globalProvider.idioma.key;
    this.httpProvider.get(url).then((res: any) => {
      if (res.error == 'false') {
        res.campaniaSMS.forEach(campania => {
          if (id != null && campania.id_campania_sms == id) {
            this.sms_status.push({ togglel: true });
          } else {
            this.sms_status.push({ togglel: false });
          }
        }, this);
        this.campaniaSMS = res.campaniaSMS;
      }
    }).catch((err) => {
      console.log('err: ', err.toString());
    });
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

  porcentage(min: number, max: number) {
    if (max != null && min != null) {
      return Math.round(((min * 100) / max));
    }
    return min * 10;
  }

  getVisitaLinkSMS(id: number) {
    this.load = this.globalProvider.cargando(this.globalProvider.data.msj.load);
    let url: string = "servicio=getVisitaLinkSMS&id_campania_sms=" + id +
      "&lg=" + this.globalProvider.idioma.key;
    this.httpProvider.get(url).then((res: any) => {
      this.load.dismiss();
      this.visitas = res.contenido;
    }).catch((err) => {
      console.log('err: ', err.toString());
      this.load.dismiss();
    });
  }

  getSMSTotalEnviado(id: number, posicion: number) {
    let url: string = "servicio=getSMSTotalEnviado&id_campaniaSMS=" + id +
      "&lg=" + this.globalProvider.idioma.key;
    this.httpProvider.get(url).then((res: any) => {
      if (res.error == 'false') {
        this.list = { id: id, sms_enviado: res.sms_enviado, status: this.campaniaSMS[posicion].estado_campania_sms, posicion: posicion };
        this.getListaSMSCampaniaSMS(true);
      }
    }).catch(err => console.log('err: ', err.toString()));
  }

  setCampaniaSMSUsuario(): void {
    this.submitted = true;
    if (this.sms_from.valid) {
      this.load = this.globalProvider.cargando(this.globalProvider.data.msj.load);
      var fecha_dispositivo = new Date();
      let url: string = "servicio=setCampaniaSMSUsuario";
      let data: Object = {
        id_usuario: this.globalProvider.usuario.id_usuario,
        nombre: this.sms_from.value.nombre,
        mensaje: this.sms_from.value.sms_text,
        fecha_dispositivo: this.fecha.transform(fecha_dispositivo),
        hora_dispositivo: this.hora.transform(fecha_dispositivo),
        hora: this.sms_from.value.hora,
        fecha: this.sms_from.value.fecha,
        campaniaSms: this.campania_sms,
        lg: this.globalProvider.idioma.key,
        link_redirect: this.sms_from.value.link_redirect,
      };
      this.httpProvider.post(data, url).then((res: any) => {
        this.load.dismiss();
        if (res.error == 'false') {
          this.sms_page = 1;
          if (res.crear_recordatorio == 'N') {
            this.list = { id: res.id, sms_enviado: 0, status: "A", posicion: 0 };
            this.getListaSMSCampaniaSMS(true);
          }
          this.getCampaniaSMSUsuario();
        } else {
          this.globalProvider.alerta(res.msn);
        }
      }).catch(err => {
        this.load.dismiss();
        console.log('err: ', err.toString());
      });
    }
  }

  getListaSMSCampaniaSMS(empesar: boolean = false) {
    let url: string = "servicio=getListaSMSCampaniaSMS&id_campaniaSMS=" + this.list.id +
      "&lg=" + this.globalProvider.idioma.key;
    this.httpProvider.get(url).then((res: any) => {
      if (res.error == 'false') {
        this.globalProvider.setListSms(this.list.id.toString(), res.sms);
        if (empesar == true) {
          if (this.globalProvider.dispositivo == true) {
            this.play();
          } else {
            this.procesosDeEnvio();
          }
        }
      }
    }).catch(err => console.log('err: ', err.toString()));
  }

  play() {
    this.hilo = setInterval(() => {
      this.procesosDeEnvio();
    }, 8000);
  }

  procesosDeEnvio() {
    if (this.globalProvider.list_sms[this.list.sms_enviado]) {
      this.setSms(this.numerico.transform(this.globalProvider.list_sms[this.list.sms_enviado].telefono), this.globalProvider.list_sms[this.list.sms_enviado].text);
      return
    }
    this.list.status = 'T';
    this.setEstadoCampaniaSMS()
    clearInterval(this.hilo);
  }

  setSms(telefono: string, text: string) {
    console.log('envia: ', telefono, text, this.list);
    this.setSMSEnviadoCampanaSMS(this.list.sms_enviado);
    this.list.sms_enviado++;
    this.sms.send(telefono, text).then(() => {
      if (!this.globalProvider.list_sms[this.list.sms_enviado]) {
        clearInterval(this.hilo);
        this.list.status = 'T';
        this.setEstadoCampaniaSMS();
      } else if (this.globalProvider.dispositivo == false) {
        let modal = this.modalController.create(ModalIosPage);
        modal.present();
        modal.onDidDismiss(data => {
          if (data == true) {
            this.procesosDeEnvio();
          } else {
            this.list.status = "P";
            this.setEstadoCampaniaSMS();
          }
        });
      }
    }).catch((err) => {
      clearInterval(this.hilo);
      this.getCampaniaSMSUsuario();
      console.log('err: ', err.toString())
    });
  }

  setEstadoCampaniaSMS() {
    let url: string = "servicio=setEstadoCampaniaSMS" +
      "&id_campaniaSMS=" + this.list.id +
      "&estado=" + this.list.status +
      "&lg=" + this.globalProvider.idioma.key;
    this.httpProvider.get(url).then(() => {
      this.getCampaniaSMSUsuario();
      if (this.globalProvider.dispositivo == false && this.list.status == 'T') {
        this.globalProvider.deleteListSms(this.list.id.toString())
      } else {
        this.globalProvider.setSMSRead(this.list.status, this.list.id.toString());
      }  
    }).catch(err => console.log('err: ', err.toString()));
  }

  setSMSEnviadoCampanaSMS(posicion: number) {
    let url: string = "servicio=setSMSEnviadoCampanaSMS&id_campaniaSMS=" + this.list.id +
      "&id_campaniaSMS_contenido=" + this.globalProvider.list_sms[posicion].id +
      "&id_usuario=" + this.globalProvider.usuario.id_usuario +
      "&lg=" + this.globalProvider.idioma.key;
    this.httpProvider.get(url).then(() => {
      this.campaniaSMS[this.list.posicion].sms_enviado = posicion;
    }).catch(err => console.log('err: ', err.toString()));
  }

  pausar(i: number) {
    this.list.status = "P";
    clearInterval(this.hilo);
    this.setEstadoCampaniaSMS();
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.getCampaniaSMSUsuario();
      refresher.complete();
    });
  }
}

@Component({
  template: `
    <ion-content padding text-center>
      <div id="siguiente" (click)="close(true)">
       <p id="parrafo">
          {{ '_tapMe' | translate }}
        </p>
    </div>
    <ion-row class="content-row">
        <ion-col id="content-row">
            <button id="content-row-btn" small ion-button block color="danger" (click)="close()">
                <ion-icon name="close">
                </ion-icon>
                &nbsp;{{ '_cancel' | translate }}
            </button>
        </ion-col>
    </ion-row>
    </ion-content>
  ` , styles: [
    `#siguiente{
      font-size: 6em;
      color:#666666; 
      height: 90% !important;
      width: 100% !important;
      display: flex;
      justify-content: center;
      align-content: center;
      flex-direction: column;
      font-weight: bold;
      #parrafo{
          display: block;
          margin: auto;
      }
    }`
  ]
})

export class ModalIosPage {
  constructor(public viewCtrl: ViewController) { }

  close(data: boolean = false) {
    this.viewCtrl.dismiss(data);
  }
}