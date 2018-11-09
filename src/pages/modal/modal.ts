import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ViewController, PopoverController } from 'ionic-angular';

import { GlobalProvider } from '../../providers/global/global';
import { HttpProvider } from '../../providers/http/http';
import { FunctionProvider } from '../../providers/function/function';
import { Fechas , Fecha, Hora, Diferencia } from '../../pipes/filtros/filtros';
import { Util, Calendario } from '../../model/interfaces';

import { AdMobFree, AdMobFreeRewardVideoConfig } from '@ionic-native/admob-free';

@IonicPage()
@Component({
  selector: 'page-modal',
  templateUrl: 'modal.html',
})

export class ModalPage {

  private diferencia = new Diferencia();
  private fechas = new Fechas();
  private fecha = new Fecha();
  private hora = new Hora();
  private llamadas = [];
  private get_fila_contenido: any;
  private tamanio_contenido: number;
  private data = {
    notas: null,
    otroTelefono: null,
    date: null,
    sms: null
  };
  private estado_msn: boolean;
  private posicion: number = 0;
  private segundos: number = 10;
  private timer: any;
  private time: { hora: number, minuto: number, segundo: number };
  private tiempo_restante: any;
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
  text: string;
  private lg: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private platform: Platform,
    private viewController: ViewController,
    private globalProvider: GlobalProvider,
    private httpProvider: HttpProvider,
    private admobFree: AdMobFree,
    private popoverController: PopoverController,
    private functionProvider: FunctionProvider
  ) {
    this.llamadas = this.navParams.get('llamadas');
    this.tamanio_contenido = this.llamadas.length;
    this.get_fila_contenido = this.llamadas[this.posicion];
    this.lg = (this.globalProvider.idioma) ? this.globalProvider.idioma.key : 'en';
  }

  ionViewDidLoad() {
    this.platform.registerBackButtonAction(() => {
      this.closeModal(true);
    });
    document.addEventListener(this.admobFree.events.REWARD_VIDEO_REWARD, (res) => {
      let creditos = res['rewardAmount'];
      let date = new Date();
      this.globalProvider.setBloqueoPublicidadUsuario('N', this.fecha.transform(date), this.hora.transform(date), creditos);
    });

    this.getCatalogoEstadoFilaCampania();
    this.animacion();
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

  prepareVideo() {
    const VideoConfig: AdMobFreeRewardVideoConfig = {
      id: 'ca-app-pub-9573570332340263/7910481161',
      autoShow: true,
      isTesting: false,
    }
    this.admobFree.rewardVideo.config(VideoConfig);
  }

  showVideo() {
    this.prepareVideo();
    this.timer = setInterval(() => {
      this.tick();
    }, 1000);
    this.admobFree.rewardVideo.prepare().then((res) => {
      this.prepareVideo();
    }).catch((err) => {
      throw new Error(err);
    });
  }

  animacion() {
    this.text = this.globalProvider.idioma.contenido['_animacion'] + " " + (this.tamanio_contenido) + " " + this.globalProvider.idioma.contenido['_animacion1']
  }

  chekedSms(event) {
    this.estado_msn = event.value;
    if (event.value == true) {
      this.data.sms = this.get_fila_contenido.sms_predeterminado;
    } else {
      this.data.sms = null;
    }
  }

  getCatalogoEstadoFilaCampania() {
    let url: string = 'servicio=getCatalogoEstadoFilaCampania&lg=' + this.lg;
    this.httpProvider.get(url).then((res: any) => {
      this.util.catalogoEstado = res;
    }).catch(err => console.log('err: ', err.toString()))
  }

  clickStado(key_estado: number) {
    if (this.globalProvider.validarTiempo() == true) {
      if (key_estado == 3 && this.estado_msn == true) {
        this.functionProvider.setSms(this.get_fila_contenido.telefono, this.data.sms);
      }
      if (key_estado == 4 && this.data.date != null) {
        let calendario: Calendario = {
          fecha: this.data.date,
          nombre: this.get_fila_contenido.nombre_campania,
          nota: this.data.notas,
          telefono: this.get_fila_contenido.telefono,
          titulo: this.get_fila_contenido.nombre_campania
        };
        this.functionProvider.setCalendar(calendario);
        this.data.date = null;
      }
      this.setFilaActivaCampania(key_estado);
    }
  }

  setFilaActivaCampania(key_estado: number) {
    let fecha = this.fechas.transform(new Date());
    let sms = (this.estado_msn == true) ? 'Y' : 'N';
    let url: string = 'servicio=setFilaActivaCampania' +
      '&id_campania=' + this.get_fila_contenido.id_campania +
      '&id_campania_contenido=' + this.get_fila_contenido.id_campania_contenido +
      '&estado=' + key_estado +
      '&notas=' + this.data.notas +
      '&otro_telefono=' + this.data.otroTelefono +
      '&fecha_hora=' + fecha +
      '&sms=' + sms +
      '&sms_texto=' + this.data.sms +
      '&individual= Y' +
      '&id_usuario=' + this.globalProvider.usuario.id_usuario +
      '&lg=' + this.lg;
    this.httpProvider.get(url).then((res: any) => {
      if (res.error == 'false') {
        let date = new Date();
        this.globalProvider.setFecha(date);
        this.data.notas = null;
        this.data.otroTelefono = null;
        this.data.date = null;
        if ((this.tamanio_contenido - 1) != this.posicion) {
          this.posicion++;
          this.get_fila_contenido = this.llamadas[this.posicion];
        } else {
          this.closeModal();
        }
      } else {
        this.globalProvider.alerta(res.mns);
      }
    }).catch(err => {
      console.log('err: ', err.toString())
      this.closeModal(true);
    });
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

  closeModal(data: boolean = false): void {
    this.viewController.dismiss(data);
  }

  setSMSPredeterminadoCampania(tipo: number, id: number) {
    let url = "servicio=setSMSPredeterminadoCampania" +
      "&id_campania=" + id +
      "&tipo=" + tipo +
      "&sms=" + this.data.sms +
      "&lg=" + this.lg;
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
}