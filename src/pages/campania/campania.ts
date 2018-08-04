import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, Platform, AlertController, PopoverController } from 'ionic-angular';

import { GlobalProvider } from '../../providers/global/global';
import { HttpProvider } from '../../providers/http/http';
import { Fechas, getMilisegundos, Fecha, Hora, Diferencia, FechaPosterios } from '../../pipes/filtros/filtros';
import { Util, Detalle, Stados } from '../../model/interfaces';

import { CallNumber } from '@ionic-native/call-number';
import { Contacts, Contact, ContactField, ContactName, ContactOrganization } from '@ionic-native/contacts';
import { SMS } from '@ionic-native/sms';
import { Calendar } from '@ionic-native/calendar';
import { AdMobFree, AdMobFreeRewardVideoConfig } from '@ionic-native/admob-free';

@IonicPage()
@Component({
  selector: 'page-campania',
  templateUrl: 'campania.html',
})
export class CampaniaPage {

  private fechaPosterios = new FechaPosterios();
  private getmilisegundos = new getMilisegundos();
  private diferencia = new Diferencia();
  private fechas = new Fechas();
  private fecha = new Fecha();
  private hora = new Hora();
  private campania: any;
  private res: any;
  private getFilaCampania: any;
  private data: Detalle = {
    notas: '',
    otroTelefono: null,
    date: null,
    sms: null
  };
  private key: any;
  private msnS: boolean;
  private contenido = [];
  private stado: Array<Stados> = [
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
  private paus: boolean = false;
  private time: { hora: number, minuto: number, segundo: number };
  private tiempo_restante: any;
  private edit_info = { readonly: true, border: 'solid #f0f0f0 1px' };
  private tipo_campania: boolean;
  private campos: { cambio: boolean, stado: Array<boolean> };
  private spinner: boolean;
  private no: boolean;
  private retroceder: boolean;
  private util: Util = {
    submitted: null,
    error: null,
    noValido: null,
    dispositivo: null,
    mostrar: null,
    msnS: null,
    catalogoEstado: [],
    nombre_archivo: null,
    sms_tex: null,
    style: { background: '', opacity: '' },
    panel_llamada: false
  };

  private min: number = 0;
  private max: number = 0;
  private spinner1: boolean;
  private panel_ios: boolean = false;
  private btn_play: boolean = false;

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
    private popoverController: PopoverController
  ) {
    this.campos = { cambio: false, stado: [false, false] };
    this.util.dispositivo = this.platform.is('android');
    this.campania = this.navParams.get('campania');
    this.posicion_campania = this.navParams.get('posicion_campania');
    this.estado = this.navParams.get('estado');
    this.posicion = this.navParams.get('posicion');
    this.tipo_campania = this.navParams.get('tipo_campania');
    this.separacion(1, this.estado, this.posicion);
    if (this.campania.sms == 'Y') {
      this.data.sms = this.campania.sms_predeterminado;
      this.msnS = true;
    } else {
      this.msnS = false;
    }
  }

  ionViewDidLoad() {
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
          this.util.panel_llamada = true;
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
      this.res = res;
      this.util.catalogoEstado = this.res;
    }).catch(err => console.log('err: ' + JSON.stringify(err)));
  }

  clickStado(key) {
    this.key = key;
    if (key == 1 || key == 2) {
      this.separacion(2);
    }
    if (key == 3) {
      if (this.msnS == true) {
        this.setSms(this.getFilaCampania.telefono);
      }
      this.separacion(2);
    }
    if (key == 4) {
      if (this.msnS == true) {
        this.setSms(this.getFilaCampania.telefono);
      }
      if (this.data.date != null) {
        this.serEventoCalendar();
      }
      this.separacion(2);
    }
  }

  setFilaActivaCampania() {
    let fecha = this.fechas.transform(new Date());
    let sms = (this.msnS == true) ? 'Y' : 'N';
    let individual = (this.individual == true) ? 'Y' : 'N';
    let url = 'servicio=setFilaActivaCampania' +
      '&id_campania=' + this.campania.id_campania +
      '&id_campania_contenido=' + this.getFilaCampania.id_campania_contenido +
      '&estado=' + this.key +
      '&notas=' + this.data.notas +
      '&otro_telefono=' + this.data.otroTelefono +
      '&fecha_hora=' + fecha +
      '&sms=' + sms +
      '&sms_texto=' + this.data.sms +
      '&individual=' + individual +
      '&id_usuario=' + this.globalProvider.usuario.id_usuario +
      '&fecha_dispositivo=' + fecha.replace('T', ' ');
    this.httpProvider.get(url).then(res => {
      this.res = res;
      if (this.res.error == 'false') {
        this.data.notas = '';
        this.data.otroTelefono = null;
        this.key = null;
        this.data.date = null;
        let date = new Date();
        this.globalProvider.setFecha(date);
        if (this.paus == false) {
          if (this.validarTiempo() == false) {
            this.util.panel_llamada = false;
          }
          if (this.individual == false && this.list_completa == true) {
            this.getFilaActivaCampania();
          } else if (this.mi_list == true) {
            this.llamarLista(this.key_selec, false, this.posicion + 1);
          } else {
            this.pausar();
          }
        } else {
          this.pausar();
        }
      } else {
        this.globalProvider.alerta(this.res.mns);
      }
    }).catch(err => console.log('err: ' + JSON.stringify(err)));
  }

  setEditContenidoCampaniaManual() {
    let cambio: string = (this.campos.cambio == true) ? 'Y' : 'N';
    let sms = (this.msnS == true) ? 'Y' : 'N';
    //let individual = (this.individual == true) ? 'Y' : 'N';
    let fecha = new Date();
    let url = 'servicio=setEditContenidoCampaniaManual' +
      "&id_campania_manual=" + this.campania.id_campania_manual +
      "&id_campania_manual_contenido=" + this.getFilaCampania.id_campania_manual_contenido +
      "&estado=" + this.key +
      "&telefono=" + this.getFilaCampania.telefono +
      "&nombre=" + this.getFilaCampania.nombre +
      "&campo_1=" + this.getFilaCampania.campo_1 +
      "&campo_2=" + this.getFilaCampania.campo_2 +
      "&nota=" + this.data.notas +
      "&otro_telefono=" + this.data.otroTelefono +
      "&sms=" + sms +
      "&sms_text=" + this.data.sms +
      "&fecha_recordatorio=" + this.fecha.transform(fecha) +
      "&hora_recordatorio=" + this.hora.transform(fecha) +
      "&hidEditField_1=" + cambio +
      "&hidEditField_2=" + cambio +
      "&hidEditField_1_valor=" + this.getFilaCampania.campo_1_text +
      "&hidEditField_2_valor=" + this.getFilaCampania.campo_1_text;
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
            this.util.panel_llamada = false;
          }
          if (this.mi_list == true) {
            this.llamarLista(this.key_selec, false, this.posicion + 1);
          } else {
            this.pausar();
          }
        } else {
          this.pausar();
        }
      } else {
        this.globalProvider.alerta(this.res.mns);
      }
    }).catch(err => console.log('err: ' + JSON.stringify(err)));
  }

  call(telefono, nuevo: boolean = true) {
    if (telefono != null && telefono.trim() != '') {
      this.callNumber.callNumber(telefono, true).then(res => {
        if (nuevo == true) {
          this.setContacto(telefono);
        }
      }).catch(err => console.log('err; ' + JSON.stringify(err)));
    }
  }

  setSms(telefono: string) {
    this.sms.send(telefono, this.data.sms).then(res => console.log('res: ' + res)).catch(err => console.log('err: ' + err));
  }

  serEventoCalendar() {
    this.calendar.hasReadWritePermission().then(res => {
      console.log('res: ' + JSON.stringify(res));
    }).catch(err => console.log('err: ' + JSON.stringify(err)));
    var startDate = new Date(this.data.date);
    this.calendar.createEvent(
      this.campania.nombre,
      'AdvanSales',
      'name: ' + this.getFilaCampania.nombre + ' , phone: ' + this.getFilaCampania.telefono + ' , note: ' + this.data.notas,
      startDate,
      this.fechaPosterios.transform(startDate, 1)
    ).then(res => {
      this.data.date = null;
    }).catch(err => console.log('err: ' + JSON.stringify(err)));
  }

  chekedSms(event) {
    this.msnS = event.value;
    if (event.value == true) {
      this.data.sms = this.campania.sms_predeterminado;
    } else {
      this.data.sms = null;
    }
  }

  setContacto(telefono) {
    let contact: Contact = this.contacts.create();
    contact.name = new ContactName(null, this.getFilaCampania.nombre, 'AS');
    contact.nickname = this.campania.nombre;
    contact.organizations = [new ContactOrganization(null, this.campania.nombre, null)];
    contact.phoneNumbers = [new ContactField('mobile', telefono)];
    contact.save().then(() => {
      console.log('res:');
    }).catch(err => console.log('err: ' + JSON.stringify(err)));
  }

  llamarLista(key: number, individual: boolean = false, posicion: number = null, llamar: boolean = true) {
    if (this.validarTiempo() == true) {
      this.key_selec = key;
      this.individual = individual;
      this.retroceder = true;
      this.posicion = posicion;
      if (key == 0 && individual == false) {
        this.getFilaActivaCampania();
        this.list_completa = true;
      } else if (individual == true) {
        this.getFilaCampania = this.contenido[posicion];
        this.util.panel_llamada = true;
        if (llamar == true) {
          this.call(this.getFilaCampania.telefono, true);
        }
      }
      if (key > 0 && individual == false) {
        if (this.contenido[posicion]) {
          this.getFilaCampania = this.contenido[posicion];
          this.util.panel_llamada = true;
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

  panelIos(key: number, individual: boolean = false, posicion: number = null, llamar: boolean = false) {
    this.key_selec = key;
    this.posicion = posicion;
    if (individual == true && llamar == false) {
      this.panel_ios = true;
    }
    if (individual == true && llamar == true) {
      this.getFilaCampania = this.contenido[posicion];
      this.util.panel_llamada = true;
      this.call(this.getFilaCampania.telefono, true);
    }
    if (individual == false) {
      this.panel_ios = false;
    }
  }

  separacion(tipo: number, estado: any = null, posicion: number = null) {
    switch (tipo) {
      case 1:
        if (this.tipo_campania == true) {
          this.estado = estado;
          this.getContenidoCampania(estado, posicion);
        } else {
          this.getContenidoCampaniaManual(estado, posicion);
        }
        break;
      case 2:
        if (this.tipo_campania == true) {
          this.setFilaActivaCampania();
        } else {
          this.setEditContenidoCampaniaManual();
        }
        break;
      default:
        console.log('no');
        break
    }
  }

  getContenidoCampania(estado: any, posicion: number) {
    if (estado.valor == '0') {
      this.no = false;
    } else {
      this.no = true;
    }
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
          this.btn_play = true;
          if (this.contenido.length > 50) {
            this.max = 50;
          } else {
            this.max = this.contenido.length;
          }
        } else {
          if (this.util.dispositivo == false) {
            this.panel_ios = false;
          }
          this.btn_play = false;
        }
        this.spinner = false;
      } else {
        this.globalProvider.alerta(this.res.msn);
        this.spinner = false;
      }
    }).catch(err => console.log('err: ' + JSON.stringify(err)));
  }

  getContenidoCampaniaManual(estado: any, posicion: number) {
    if (estado.valor == '0') {
      this.no = false;
    } else {
      this.no = true;
    }
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
    let url = 'servicio=getContenidoCampaniaManual&id_campania= ' + this.campania.id_campania_manual + '&id_estado=' + estado.key_estado + '&todos=N';
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
    this.data.date = null;
    this.getCampaniaUsuario();
    this.util.panel_llamada = false;
    this.edit_info = { readonly: true, border: 'solid #f0f0f0 1px' };
    this.separacion(1, this.estado, this.key_selec);
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
        if (this.tipo_campania == true) {
          this.campania = this.res.campania[this.posicion_campania];
        } else {
          this.campania = this.res.manual.campania[this.posicion_campania];
        }
      } else {
        this.globalProvider.alerta(this.res.mns);
      }
    }).catch(err => console.log('err: ' + JSON.stringify(err)));
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
    }).catch(err => console.log('err: ' + JSON.stringify(err)));
  }

  habilitar(i: number) {
    this.campos.cambio = true;
    this.campos.stado[i] = !this.campos.stado[i];
  }

  setSMSPredeterminadoCampania(tipo: number, id: number) {
    let url = "servicio=setSMSPredeterminadoCampania" +
      "&id_campania=" + id +
      "&tipo=" + tipo +
      "&sms=" + this.data.sms;
    this.httpProvider.get(url).then(res => {
      this.res = res;
      if (this.res.error == 'false') {
        this.globalProvider.alerta(this.res.msn);
      } else {
        this.globalProvider.alerta(this.res.msn);
      }
    }).catch(err => console.log('err: ' + JSON.stringify(err)));
  }

  popoverInfo(posicion: number) {
    let popover = this.popoverController.create('PopoverPage', { posicion: posicion });
    popover.present();
  }

  cargarMas() {
    this.spinner1 = true;
    if (this.contenido.length > (this.max + 50)) {
      this.max += 50;
    } else {
      this.max = this.contenido.length;
    }
    this.spinner1 = false;
  }

  desuso() {
    console.log(this.min + ' ' + this.spinner1 + ' ' + this.spinner + ' ' + this.no + ' ' + this.retroceder + ' ' + this.panel_ios + " " + this.btn_play);
  }
}