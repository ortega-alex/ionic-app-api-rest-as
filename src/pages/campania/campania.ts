import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, Platform, PopoverController } from 'ionic-angular';

import { GlobalProvider } from '../../providers/global/global';
import { HttpProvider } from '../../providers/http/http';
import { Fechas, Fecha, Hora, Diferencia } from '../../pipes/filtros/filtros';
import { Util, Detalle, Stados, Calendario } from '../../model/interfaces';

import { AdMobFree, AdMobFreeRewardVideoConfig } from '@ionic-native/admob-free';
import { FunctionProvider } from '../../providers/function/function';

@IonicPage()
@Component({
  selector: 'page-campania',
  templateUrl: 'campania.html',
})

export class CampaniaPage {
  private diferencia = new Diferencia();
  private fechas = new Fechas();
  private fecha = new Fecha();
  private hora = new Hora();
  private campania: any;
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
  spinner: boolean;
  no: boolean;
  retroceder: boolean;
  private util: Util = {
    submitted: null,
    error: null,
    noValido: null,
    mostrar: null,
    msnS: null,
    catalogoEstado: [],
    nombre_archivo: null,
    sms_tex: null,
    panel_llamada: false
  };

  min: number = 0;
  private max: number = 0;
  spinner1: boolean;
  panel_ios: boolean = false;
  btn_play: boolean = false;
  llamo: string = 'N';

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private globalProvider: GlobalProvider,
    private httpProvider: HttpProvider,
    private viewController: ViewController,
    private platform: Platform,
    private admobFree: AdMobFree,
    private popoverController: PopoverController,
    private functionProvider : FunctionProvider
  ) {
    this.campos = { cambio: false, stado: [false, false] };
    this.campania = this.navParams.get('campania');
    this.posicion_campania = this.navParams.get('posicion_campania');
    this.estado = this.navParams.get('estado');
    this.posicion = this.navParams.get('posicion');
    this.tipo_campania = this.navParams.get('tipo_campania');
    this.separacion(1, this.estado, this.posicion);
    if (this.campania.sms == 'Y') {
      if (this.globalProvider.plan.leads == 'N') {
        this.msnS = false;
        return;
      }
      this.data.sms = this.campania.sms_predeterminado;
      this.msnS = true;
    } else {
      this.msnS = false;
    }
  }

  ionViewDidLoad() {
    if (this.globalProvider.plan.mostrar_publicidad_video == 'N') {
      this.prepareVideo();
      this.globalProvider.getTime();
    }
    document.addEventListener(this.admobFree.events.REWARD_VIDEO_REWARD, (res) => {
      let creditos = res['rewardAmount'];
      let date = new Date();
      this.globalProvider.setBloqueoPublicidadUsuario('N', this.fecha.transform(date), this.hora.transform(date), creditos);
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
    let url: string = 'servicio=getFilaActivaCampania&id_campania=' + this.campania.id_campania +
      '&lg=' + this.globalProvider.idioma.key;
    this.httpProvider.get(url).then((res: any) => {
      if (res.error == 'false') {
        if (res.estado != 'F') {
          this.getFilaCampania = res;
          if (this.globalProvider.plan.leads != 'P') {
            this.data.sms = null;
            this.msnS = false;
          } else {
            this.data.sms = res.sms_predeterminado;
          }
          this.util.panel_llamada = true;
          this.functionProvider.call(this.getFilaCampania.telefono , this.campania.nombre , this.getFilaCampania.nombre , true )
        } else {
          this.pausar();
        }
      } else {
        this.pausar();
      }
    }).catch(err => console.log('err: ', err.toString()));
  }

  getCatalogoEstadoFilaCampania() {
    let url: string = 'servicio=getCatalogoEstadoFilaCampania&lg=' + this.globalProvider.idioma.key;
    this.httpProvider.get(url).then((res: any) => {
      this.util.catalogoEstado = res;
    }).catch(err => console.log('err: ', err.toString()));
  }

  clickStado(key) {
    this.key = key;    
    if (key == 3  && this.msnS == true) {
        this.functionProvider.setSms(this.getFilaCampania.telefono , this.data.sms);
    }    
    if (key == 4 && this.data.date != null) {
        let calendario: Calendario = {
          fecha: this.data.date,
          nombre: this.getFilaCampania.nombre,
          nota: this.data.notas,
          telefono: this.getFilaCampania.telefono,
          titulo: this.campania.nombre
        }
        this.functionProvider.setCalendar(calendario);
        this.data.date = null
     }
    this.separacion(2);
  }

  setFilaActivaCampania() {
    let fecha = this.fechas.transform(new Date());
    let sms = (this.msnS == true) ? 'Y' : 'N';
    let individual = (this.individual == true) ? 'Y' : 'N';
    let url: string = 'servicio=setFilaActivaCampania' +
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
      '&fecha_dispositivo=' + fecha.replace('T', ' ') +
      '&llamo=' + this.llamo +
      '&lg=' + this.globalProvider.idioma.key;

    this.httpProvider.get(url).then((res: any) => {
      if (res.error == 'false') {
        this.data.notas = '';
        this.data.otroTelefono = null;
        this.key = null;
        this.data.date = null;
        let date = new Date();
        this.globalProvider.setFecha(date);
        this.llamo = 'N';
        if (this.paus == false) {
          if (this.globalProvider.validarTiempo() == false) {
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
        this.globalProvider.alerta(res.mns);
      }
    }).catch(err => console.log('err: ' + err.toString()));

  }

  setEditContenidoCampaniaManual() {
    let cambio: string = (this.campos.cambio == true) ? 'Y' : 'N';
    let sms = (this.msnS == true) ? 'Y' : 'N';
    let fecha = new Date();
    let url: string = 'servicio=setEditContenidoCampaniaManual' +
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
      "&hidEditField_2_valor=" + this.getFilaCampania.campo_1_text +
      '&llamo=' + this.llamo +
      '&lg=' + this.globalProvider.idioma.key;
    this.httpProvider.get(url).then((res: any) => {
      if (res.error == 'false') {
        this.data.notas = '';
        this.data.otroTelefono = null;
        this.key = null;
        let date = new Date();
        this.globalProvider.setFecha(date);
        this.llamo = 'N';
        if (this.paus == false) {
          if (this.globalProvider.validarTiempo() == false) {
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
        this.globalProvider.alerta(res.mns);
      }
    }).catch(err => console.log('err: ', err.toString()));
  }

  chekedSms(event) {
    this.msnS = event.value;
    if (event.value == true) {
      this.data.sms = this.campania.sms_predeterminado;
    } else {
      this.data.sms = null;
    }
  }

  llamarLista(key: number, individual: boolean = false, posicion: number = null, llamar: boolean = true) {
    if (this.globalProvider.validarTiempo() == true) {
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
          this.functionProvider.call(this.getFilaCampania.telefono , this.campania.nombre , this.getFilaCampania.nombre , true )
        }
      }
      if (key > 0 && individual == false) {
        if (this.contenido[posicion]) {
          this.getFilaCampania = this.contenido[posicion];
          this.util.panel_llamada = true;
          if (llamar == true) {
            this.functionProvider.call(this.getFilaCampania.telefono , this.campania.nombre , this.getFilaCampania.nombre , true )
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
      this.functionProvider.call(this.getFilaCampania.telefono , this.campania.nombre , this.getFilaCampania.nombre , true )
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
    let url: string = 'servicio=getContenidoCampania&id_campania= ' + this.campania.id_campania +
      '&id_estado=' + posicion +
      '&todos=N&lg=' + this.globalProvider.idioma.key;
    this.httpProvider.get(url).then((res: any) => {
      if (res.error == 'false') {
        if (res.contenido.length > 0) {
          this.contenido = res.contenido;
          this.btn_play = true;
          if (this.contenido.length > 50) {
            this.max = 50;
          } else {
            this.max = this.contenido.length;
          }
        } else {
          if (this.globalProvider.dispositivo == false) {
            this.panel_ios = false;
          }
          this.btn_play = false;
        }
        this.spinner = false;
      } else {
        this.globalProvider.alerta(res.msn);
        this.spinner = false;
      }
    }).catch(err => console.log('err: ', err.toString()));
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
    let url: string = 'servicio=getContenidoCampaniaManual&id_campania= ' + this.campania.id_campania_manual +
      '&id_estado=' + estado.key_estado +
      '&todos=N&lg=' + this.globalProvider.idioma.key;
    this.httpProvider.get(url).then((res: any) => {
      if (res.error == 'false') {
        if (res.contenido.length > 0) {
          this.contenido = res.contenido;
          this.btn_play = true;
          if (this.contenido.length > 50) {
            this.max = 50;
          } else {
            this.max = this.contenido.length;
          }
        } else {
          this.btn_play = false;
        }
        this.spinner = false;
      } else {
        this.globalProvider.alerta(res.msn);
        this.spinner = false;
      }
    }).catch(err => console.log('err: ', err.toString()));
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
    let url: string = 'servicio=getCampaniaUsuario&id_usuario=' + this.globalProvider.usuario.id_usuario +
      '&lg=' + this.globalProvider.idioma.key;
    this.httpProvider.get(url).then((res: any) => {
      if (res.error == 'false') {
        if (this.tipo_campania == true) {
          this.campania = res.campania[this.posicion_campania];
        } else {
          this.campania = res.manual.campania[this.posicion_campania];
        }
      } else {
        this.globalProvider.alerta(res.mns);
      }
    }).catch(err => console.log('err: ', err.toString()));
  }

  editInfo() {
    this.edit_info.readonly = !this.edit_info.readonly;
    this.edit_info.border = "solid green 1px";
  }

  saveInfo() {
    this.edit_info.readonly = !this.edit_info.readonly;
    this.edit_info.border = "none";
    let url: string = "servicio=setEditarCampaniaContenido" +
      "&id_campania_contenido=" + this.getFilaCampania.id_campania_contenido +
      "&telefono=" + this.getFilaCampania.telefono +
      "&nombre=" + this.getFilaCampania.nombre +
      "&campo1=" + this.getFilaCampania.campo_1 +
      "&campo2=" + this.getFilaCampania.campo_2 +
      "&campo3=" + this.getFilaCampania.campo_3 +
      "&campo4=" + this.getFilaCampania.campo_4 +
      "&otro_telefono=" + this.getFilaCampania.otro_telefono +
      "&nota=" + this.data.notas +
      '&lg=' + this.globalProvider.idioma.key;
    this.httpProvider.get(url).catch(err => console.log('err: ', err.toString()));
  }

  habilitar(i: number) {
    this.campos.cambio = true;
    this.campos.stado[i] = !this.campos.stado[i];
  }

  setSMSPredeterminadoCampania(tipo: number, id: number) {
    let url: string = "servicio=setSMSPredeterminadoCampania" +
      "&id_campania=" + id +
      "&tipo=" + tipo +
      "&sms=" + this.data.sms +
      '&lg=' + this.globalProvider.idioma.key;
    this.httpProvider.get(url).then((res: any) => {
      if (res.error == 'false') {
        this.globalProvider.alerta(res.msn);
      } else {
        this.globalProvider.alerta(res.msn);
      }
    }).catch(err => console.log('err: ', err.toString()));
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

  getBorder(color: string) {
    return "solid 1px " + color;
  }
}