import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, Platform, AlertController, List, ModalController } from 'ionic-angular';

import { GlobalProvider } from '../../providers/global/global';
import { HttpProvider } from '../../providers/http/http';
import { Numerico, Replace, Fechas, getMilisegundos, Fecha, Hora, Diferencia, FechaPosterios } from '../../pipes/filtros/filtros';

import { CallNumber } from '@ionic-native/call-number';
import { Contacts, Contact, ContactField, ContactName, ContactOrganization } from '@ionic-native/contacts';
import { SMS } from '@ionic-native/sms';
import { Calendar } from '@ionic-native/calendar';
import { AdMobFree, AdMobFreeBannerConfig, AdMobFreeRewardVideoConfig } from '@ionic-native/admob-free';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';

import { ModalPage } from '../modal/modal';

@IonicPage()
@Component({
  selector: 'page-campania',
  templateUrl: 'campania.html',
})
export class CampaniaPage {

  private fechaPosterios = new FechaPosterios();
  private getmilisegundos = new getMilisegundos();
  private diferencia = new Diferencia();
  private numerico = new Numerico();
  private replace = new Replace();
  private fechas = new Fechas();
  private fecha = new Fecha();
  private hora = new Hora();
  private key_estado: number;
  private campania: any;
  private panelLlamada: boolean = false;
  private res: any;
  private getFilaCampania: any;
  private getFilaCampaniaC = [];
  private catalogoEstado: any;
  private data = {
    notas: '',
    otroTelefono: null,
    date: null,
    sms: null
  };
  private key: any;
  private msnS: boolean;
  private spinner: boolean;
  private contenido = [];
  private stado = [
    { border: 'none' },
    { border: 'none' },
    { border: 'none' },
    { border: 'none' },
    { border: 'none' }
  ];
  private boton = { key_estado: null, color: '', estado: '' };
  private estado: any;
  private posicion: any;
  private nota: boolean = false;
  private nP: number;
  private individual: boolean;
  private mi_list: boolean;
  private list_completa: boolean;
  private key_selec: number;
  private posicion_campania: number;
  private segundos: number = 10;
  private timer: any;
  private no: boolean;
  private buttom = { color: '#ff0000', sms: 'stop dialing' };
  private paus: boolean = false;
  private time: { hora: number, minuto: number, segundo: number };
  private tiempo_restante: any;
  private retroceder: boolean;
  private edit_info = { readonly: true, border: 'solid #f0f0f0 1px' };
  private dispositivo: boolean;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private globalProvider: GlobalProvider,
    private httpProvider: HttpProvider,
    private callNumber: CallNumber,
    private viewController: ViewController,
    private sms: SMS,
    private calendar: Calendar,
    private platform: Platform,
    private contacts: Contacts,
    private admobFree: AdMobFree,
    private alertController: AlertController,
    private modalController: ModalController
  ) {
    this.campania = this.navParams.get('campania');
    this.posicion_campania = this.navParams.get('posicion_campania');
    this.estado = this.navParams.get('estado');
    this.posicion = this.navParams.get('posicion');
    this.getContenidoCampania(this.estado, this.posicion);
    if (this.campania.sms == 'Y') {
      this.data.sms = this.campania.sms_predeterminado;
      this.msnS = true;
    } else {
      this.msnS = false;
    }
  }

  ionViewDidLoad() {
    this.dispositivo = (this.platform.is('android') ? true : false);
    if (this.globalProvider.plan.mostrar_publicidad_video == true) {
      this.prepareVideo();
      this.globalProvider.getTime();
    }
    document.addEventListener(this.admobFree.events.REWARD_VIDEO_REWARD, (res) => {
      let creditos = res['rewardAmount'];
      let date = new Date();
      this.setBloqueoPublicidadUsuario('N', this.fecha.transform(date), this.hora.transform(date), creditos);
    });
    this.getCatalogoEstadoFilaCampania();
    this.platform.registerBackButtonAction(() => {
      this.regresar();
    });
    this.tiempoActual();
  }

  ionViewWillUnload() {
    this.platform.registerBackButtonAction(() => {
      this.platform.exitApp();
    });
  }

  tick(): void {
    if (--this.segundos == 0) {
      clearInterval(this.timer);
      this.segundos = 10;
    }
  }

  tiempo(): void {
    if (--this.time.segundo < 0) {
      this.time.segundo = 59;
      if (--this.time.minuto < 0) {
        this.time.minuto = 59;
        if (--this.time.hora <= 0) {
          clearInterval(this.tiempo_restante);
          this.time = null;
        }
      }
    }
  }

  tiempoActual() {
    let date = new Date().getTime();
    let d = this.globalProvider.time;
    if (date < d) {
      var dif = d - date;
      this.time = this.diferencia.transform(dif);
      this.tiempo_restante = setInterval(() => {
        this.tiempo();
      }, 1000);
    }
  }

  validarTiempo() {
    let date = new Date().getTime();
    if ((!this.globalProvider.time || date >= this.globalProvider.time) && this.globalProvider.plan.mostrar_publicidad_video == true) {
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
    let url = 'servicio=setBloqueoPublicidadUsuario' +
      '&bloqueo=' + tipo +
      '&id_usuario=' + this.globalProvider.usuario.id_usuario +
      '&fecha=' + fecha +
      '&hora=' + hora +
      '&creditos=' + creditos;
    this.httpProvider.get(url).then(res => {
      this.res = res;
      if (this.res.error == 'false') {
        let date = new Date(this.res.tiempo_usuario);
        let hora = this.res.tiempo_suma;
        this.globalProvider.setTime(this.getmilisegundos.transform(date));
        this.tiempoActual();
      }
    }).catch(err => console.log('err: ' + JSON.stringify(err)));
  }

  prepareVideo() {
    const VideoConfig: AdMobFreeRewardVideoConfig = {
      id: 'ca-app-pub-9573570332340263/7910481161',
      autoShow: true,
      isTesting: false,
    }
    this.admobFree.rewardVideo.config(VideoConfig);
  }

  showVideo() {
    this.timer = setInterval(() => {
      this.tick();
    }, 1000);
    this.admobFree.rewardVideo.prepare().then((res) => {
      this.prepareVideo();
    }).catch((err) => {
      throw new Error(err);
    });
  }

  regresar(data: boolean = false) {
    this.viewController.dismiss(data);
  }

  getFilaActivaCampania() {
    let url = 'servicio=getFilaActivaCampania&id_campania=' + this.campania.id_campania;
    this.httpProvider.get(url).then(res => {
      this.res = res;
      if (this.res.error == 'false') {
        if (this.res.estado != 'F') {
          this.getFilaCampania = this.res;
          this.data.sms = this.res.sms_predeterminado;
          this.panelLlamada = true;
          this.call(this.getFilaCampania.telefono, true);
        } else {
          this.pausar();
        }
      } else {
        this.pausar();
      }
    }).catch(err => console.log('err: ' + JSON.stringify(err)));
  }

  getCatalogoEstadoFilaCampania() {
    let url = 'servicio=getCatalogoEstadoFilaCampania';
    this.httpProvider.get(url).then(res => {
      this.catalogoEstado = res;
    }).catch(err => console.log('err: ' + JSON.stringify(err)));
  }

  clickStado(key) {
    this.key = key;
    if (key == 1 || key == 2) {
      this.setFilaActivaCampania();
    }
    if (key == 3) {
      if (this.msnS == true) {
        if (this.dispositivo == true) {
          this.setSms(this.getFilaCampania.telefono);
          this.setFilaActivaCampania();
        } else {
          this.setSms(this.getFilaCampania.telefono);
          let data = { view: 4, num: null }
          let modal = this.modalController.create('ModalPage', { data: data });
          modal.present();
          modal.onDidDismiss(data => {
            if (data == true) {
              this.setFilaActivaCampania();
            }
          });
        }
      }
    }
    if (key == 4) {
      if (this.msnS == true) {
        if (this.dispositivo == true) {
          this.setSms(this.getFilaCampania.telefono);
        } else {
          this.setSms(this.getFilaCampania.telefono);
          let data = { view: 4, num: null }
          let modal = this.modalController.create('ModalPage', { data: data });
          modal.present();
          modal.onDidDismiss(data => {
            if (data == true) {
              this.setFilaActivaCampania();
            }
          });
        }
      }
      this.serEventoCalendar();
    }
  }

  setFilaActivaCampania() {
    let sms = (this.msnS == true) ? 'Y' : 'N';
    let individual = (this.individual == true) ? 'Y' : 'N';
    let url = 'servicio=setFilaActivaCampania' +
      '&id_campania=' + this.campania.id_campania +
      '&id_campania_contenido=' + this.getFilaCampania.id_campania_contenido +
      '&estado=' + this.key +
      '&notas=' + this.data.notas +
      '&otro_telefono=' + this.data.otroTelefono +
      '&fecha_hora=' + this.data.date +
      '&sms=' + sms +
      '&sms_texto=' + this.data.sms +
      '&individual=' + individual +
      '&id_usuario=' + this.globalProvider.usuario.id_usuario +
      '&fecha_dispositivo=' + this.data.date.replace('T', ' ');
    this.httpProvider.get(url).then(res => {
      this.res = res;
      if (this.res.error == 'false') {
        this.data.notas = '';
        this.data.otroTelefono = null;
        this.key = null;
        let date = new Date();
        this.globalProvider.setFecha(date);
        if (this.paus == false) {
          if (this.validarTiempo() == false) {
            this.panelLlamada = false;
          }
          if (this.individual == false && this.list_completa == true) {
            this.getFilaActivaCampania();
          } else if (this.mi_list == true) {
            this.llamarLista(this.key_selec, false, this.posicion + 1);
          } else {
            this.pausar();
          }
        } else {
          this.pausarLlamada();
          this.pausar();
        }
      } else {
        this.globalProvider.alerta(this.res.mns);
      }
    }).catch(err => console.log('err: ' + JSON.stringify(err)));
  }

  call(telefono, nuevo: boolean = true) {
    this.callNumber.callNumber(this.numerico.transform(telefono), true).then(res => {
      if (nuevo == true) {
        this.setContacto(telefono);
      }
    }).catch(err => console.log('err; ' + JSON.stringify(err)));
  }

  setSms(telefono: string) {
    this.sms.send(this.numerico.transform(telefono), this.data.sms).then(res => console.log('res: ' + res)).catch(err => console.log('err: ' + err));
  }

  serEventoCalendar() {
    this.calendar.hasReadWritePermission().then(res => {
      console.log('res: ' + JSON.stringify(res));
    }).catch(err => alert('err: ' + JSON.stringify(err)));
    var startDate = new Date(this.data.date);
    this.calendar.createEvent(
      this.campania.nombre,
      'PowerDialer',
      'name: ' + this.getFilaCampania.nombre + ' , phone: ' + this.numerico.transform(this.getFilaCampania.telefono) + ' , note: ' + this.data.notas,
      startDate,
      this.fechaPosterios.transform(startDate, 1)
    ).then(res => {
      if (this.dispositivo == true) {
        this.setFilaActivaCampania();
      }
    }).catch(err => console.log('err: ' + JSON.stringify(err)));
  }

  chekedSms(event) {
    this.msnS = event.value;
  }

  setContacto(telefono) {
    let contact: Contact = this.contacts.create();
    contact.name = new ContactName(null, 'PD', this.getFilaCampania.nombre);
    contact.nickname = this.campania.nombre;
    contact.organizations = [new ContactOrganization(null, this.campania.nombre, null)];
    contact.phoneNumbers = [new ContactField('mobile', this.numerico.transform(telefono))];
    contact.save().then(() => {
      console.log('res:');
    }).catch(err => console.log('err: ' + JSON.stringify(err)));
  }

  llamarLista(key: number, individual: boolean = false, posicion: number = null, llamar: boolean = true) {
    if (this.validarTiempo() == true) {
      this.key_selec = key;
      this.individual = individual;
      this.retroceder = individual;
      this.posicion = posicion;
      if (key == 0 && individual == false) {
        this.getFilaActivaCampania();
        this.list_completa = true;
      } else if (individual == true) {
        this.getFilaCampania = this.contenido[posicion];
        this.panelLlamada = true;
        if (llamar == true) {
          this.call(this.getFilaCampania.telefono, true);
        }
      }
      if (key > 0 && individual == false) {
        if (this.contenido[posicion]) {
          this.getFilaCampania = this.contenido[posicion];
          this.panelLlamada = true;
          if (llamar == true) {
            this.call(this.getFilaCampania.telefono, true);
          }
          this.mi_list = true;
          this.individual = true;
        } else {
          this.pausar();
        }
      }
    }
  }

  getContenidoCampania(estado: any, posicion: number) {
    if (estado.valor == '0') {
      this.no = false;
    } else {
      this.no = true;
    }
    var date = new Date();
    this.data.date = this.fechas.transform(date);
    this.contenido = [];
    this.spinner = true;
    for (let s of this.stado) {
      if (s.border != 'none') {
        s.border = 'none';
      }
    }
    this.stado[posicion].border = 'solid gray 4px';
    this.boton.color = '#' + estado.color;
    this.boton.estado = estado.texto;
    this.boton.key_estado = estado.key_estado;
    this.key_selec = estado.key_estado;
    let url = 'servicio=getContenidoCampania&id_campania= ' + this.campania.id_campania + '&id_estado=' + posicion + '&todos=N';
    this.httpProvider.get(url).then(res => {
      this.res = res;
      if (this.res.error == 'false') {
        if (this.res.contenido.length > 0) {
          this.contenido = this.res.contenido;
        }
        this.spinner = false;
      } else {
        this.globalProvider.alerta(this.res.msn);
        this.spinner = false;
      }
    }).catch(err => console.log('err: ' + JSON.stringify(err)));
  }

  pausar() {
    this.getCampaniaUsuario();
    this.panelLlamada = false;
    this.edit_info = { readonly: true, border: 'solid #f0f0f0 1px' };
    this.getContenidoCampania(this.estado, this.key_selec);
  }

  togell(i: number) {
    if (i == this.nP) {
      this.nota = !this.nota;
    } else {
      if (this.nota == false) {
        this.nota = !this.nota;
        this.nP = i;
      } else {
        this.nP = i;
      }
    }
  }

  getCampaniaUsuario() {
    let url = 'servicio=getCampaniaUsuario&' +
      'id_usuario=' + this.globalProvider.usuario.id_usuario;
    this.httpProvider.get(url).then(res => {
      this.res = res;
      if (this.res.error == 'false') {
        this.campania = this.res.campania[this.posicion_campania];
      } else {
        this.globalProvider.alerta(this.res.mns);
      }
    }).catch(err => console.log('err: ' + JSON.stringify(err)));
  }

  pausarLlamada() {
    this.paus = !this.paus;
    if (this.paus == true) {
      this.buttom = { color: '#990000', sms: 'update state and exit' };
    } else {
      this.buttom = { color: '#ff0000', sms: 'stop dialing' };
    }
  }

  editInfo() {
    this.edit_info.readonly = !this.edit_info.readonly;
    this.edit_info.border = "solid green 1px";
  }

  saveInfo() {
    this.edit_info.readonly = !this.edit_info.readonly;
    this.edit_info.border = "none";
    let url = "servicio=setEditarCampaniaContenido" +
      "&id_campania_contenido=" + this.getFilaCampania.id_campania_contenido +
      "&telefono=" + this.getFilaCampania.telefono +
      "&nombre=" + this.getFilaCampania.nombre +
      "&campo1=" + this.getFilaCampania.campo_1 +
      "&campo2=" + this.getFilaCampania.campo_2 +
      "&campo3=" + this.getFilaCampania.campo_3 +
      "&campo4=" + this.getFilaCampania.campo_4 +
      "&otro_telefono=" + this.getFilaCampania.otro_telefono +
      "&nota=" + this.data.notas;
    this.httpProvider.get(url).then(res => {
      this.res = res;
      console.log(JSON.stringify(this.res));
    }).catch(err => console.log('err: ' + JSON.stringify(err)));
  }
}