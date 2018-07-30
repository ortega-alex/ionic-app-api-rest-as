import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ViewController, AlertController, PopoverController } from 'ionic-angular';

import { GlobalProvider } from '../../providers/global/global';
import { HttpProvider } from '../../providers/http/http';
import { Fechas, Replace, getMilisegundos, Fecha, Hora, Diferencia } from '../../pipes/filtros/filtros';
import { Util, Tutorial, DataModal } from '../../model/interfaces';

import { CallNumber } from '@ionic-native/call-number';
import { SMS } from '@ionic-native/sms';
import { Calendar } from '@ionic-native/calendar';
import { AdMobFree, AdMobFreeRewardVideoConfig } from '@ionic-native/admob-free';
import { InAppPurchase2, IAPProduct , IAPProductOptions } from '@ionic-native/in-app-purchase-2';
import { Producto } from '../../model/Producto';

@IonicPage()
@Component({
  selector: 'page-modal',
  templateUrl: 'modal.html',
})
export class ModalPage {

  private data1: DataModal // { view: number, num: number, imagenes: Array<Imagenes> };
  private res: any;
  private diferencia = new Diferencia();
  private replace = new Replace();
  private fechas = new Fechas();
  private fecha = new Fecha();
  private hora = new Hora();
  private llamadas = [];
  private getmilisegundos = new getMilisegundos();
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
  private text: string = "You contacted ";
  private segundos: number = 10;
  private timer: any;
  private time: { hora: number, minuto: number, segundo: number };
  private tiempo_restante: any;
  private tutorial: Tutorial = {
    nombre: null,
    imagenes: []
  }
  private util: Util = {
    submitted: null,
    error: null,
    noValido: null,
    dispositivo: null,
    mostrar: null,
    msnS: null,
    catalogoEstado: [], //catalogo_estado
    nombre_archivo: null,
    sms_tex: null,
    style: { background: '', opacity: '' },
    panel_llamada: false
  };


  private products: Array<Producto>;
  private dispositivo: boolean;
  private readonly: Array<{ product: boolean }>;
  //private id : any ;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private platform: Platform,
    private viewController: ViewController,
    private globalProvider: GlobalProvider,
    private httpProvider: HttpProvider,
    private callNumber: CallNumber,
    private sms: SMS,
    private calendar: Calendar,
    private alertController: AlertController,
    private admobFree: AdMobFree,
    private popoverController: PopoverController,
    private store: InAppPurchase2
  ) {
    this.products = [];
    this.readonly = [];
    this.dispositivo = this.platform.is('android');
    this.data1 = this.navParams.get('data');
    if (this.data1.view == 2) {
      this.util.style = { background: 'black', opacity: '' };
      if (this.data1.num != null) {
        this.tutorial.imagenes = [
          { url: 'assets/imgs/demo1.jpg' },
          { url: 'assets/imgs/demo2.jpg' },
          { url: 'assets/imgs/demo3.jpg' },
          { url: 'assets/imgs/demo4.jpg' }
        ];
      } else {
        this.tutorial.imagenes = this.data1.imagenes;
      }
    } else {
      this.util.style = { background: '', opacity: '' };
    }
    if (this.data1.view == 1) {
      this.llamadas = this.navParams.get('llamadas');
      this.tamanio_contenido = this.llamadas.length;
      this.get_fila_contenido = this.llamadas[this.posicion];
    }

    if (this.data1.view == 5) {
      this.getProductoUsuario();
    }
  }

  ionViewDidLoad() {
    this.platform.registerBackButtonAction(() => {
      this.closeModal(true);
    });
    document.addEventListener(this.admobFree.events.REWARD_VIDEO_REWARD, (res) => {
      let creditos = res['rewardAmount'];
      let date = new Date();
      this.setBloqueoPublicidadUsuario('N', this.fecha.transform(date), this.hora.transform(date), creditos);
    });
    this.getCatalogoEstadoFilaCampania();
    this.animacion();
    this.tiempoActual();
    //this.configurePurchasing();  
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
    });
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
    this.text = this.text + (this.tamanio_contenido) + " leads, let's quickly update your notes now";
  }

  call() {
    if (this.validarTiempo() == true) {
      if (this.get_fila_contenido.telefono != null && this.get_fila_contenido.telefono.trim() != '') {
        this.callNumber.callNumber(this.get_fila_contenido.telefono, true).then(res => {
          console.log('llamando');
        }).catch(err => console.log(err));
      }
    }
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
    let url = 'servicio=getCatalogoEstadoFilaCampania';
    this.httpProvider.get(url).then(res => {
      this.res = res;
      this.util.catalogoEstado = this.res;
    })
  }

  clickStado(key_estado: number) {
    if (this.validarTiempo() == true) {
      if (key_estado == 1 || key_estado == 2) {
        this.setFilaActivaCampania(key_estado);
      }
      if (key_estado == 3) {
        if (this.estado_msn == true) {
          this.setSms();
        }
        this.setFilaActivaCampania(key_estado);
      }
      if (key_estado == 4) {
        if (this.estado_msn == true) {
          this.setSms();
        }
        if (this.data.date != null) {
          this.serEventoCalendar();
        }
        this.setFilaActivaCampania(key_estado);
      }
    }
  }

  setFilaActivaCampania(key_estado: number) {
    let fecha = this.fechas.transform(new Date());
    let sms = (this.estado_msn == true) ? 'Y' : 'N';
    let url = 'servicio=setFilaActivaCampania' +
      '&id_campania=' + this.get_fila_contenido.id_campania +
      '&id_campania_contenido=' + this.get_fila_contenido.id_campania_contenido +
      '&estado=' + key_estado +
      '&notas=' + this.data.notas +
      '&otro_telefono=' + this.data.otroTelefono +
      '&fecha_hora=' + fecha +
      '&sms=' + sms +
      '&sms_texto=' + this.data.sms +
      '&individual= Y' +
      '&id_usuario=' + this.globalProvider.usuario.id_usuario;
    this.httpProvider.get(url).then(res => {
      this.res = res;
      alert('url: ' + url);
      if (this.res.error == 'false') {
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
        this.globalProvider.alerta(this.res.mns);
      }
    }).catch(err => alert('err: ' + JSON.stringify(err)));
  }

  setSms() {
    this.sms.send(this.get_fila_contenido.telefono, this.data.sms);
  }

  serEventoCalendar() {
    var startDate = new Date(this.replace.transform(this.data.date));
    this.calendar.createEvent(
      this.get_fila_contenido.nombre_campania,
      'AdvanSales',
      'name: ' + this.get_fila_contenido.nombre_campania + ' , phone: ' + this.get_fila_contenido.telefono + ' , note: ' + this.data.notas,
      startDate,
      startDate
    ).then(res => {
      this.data.date = null;
    }).catch(err => alert(err));
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
    if (this.data1.view == 2) {
      this.data1.num++;
      this.globalProvider.setNum(this.data1.num);
    }
    this.viewController.dismiss(data);
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

  getProductoUsuario() {   
    let dispositivo: string = (this.dispositivo == true) ? 'android' : 'ios';
    let url: string = "servicio=getSuscrpcionUsuario";
    let data = {
      "id_usuario": this.globalProvider.usuario.id_usuario,
      "plataforma": dispositivo
    };
    this.httpProvider.post(data, url).then(res => {
      this.res = res;
      for (let p of this.res) {
        let product: boolean = (p.suscrito == 'Y') ? true : false;
        this.readonly.push({ product: product });
      }
      this.products = this.res;
      console.log(this.products);
    }).catch(err => console.log('err: ' + err));
  }

  async purchase(arg: any) {
    var order: any;
 
    this.configurePurchasing(arg);
    console.log('Products: ' + JSON.stringify(this.store.products));
    try {
      let product = this.store.get(arg.id_producto);
      console.log('product: ' + JSON.stringify(product));
      if (arg.id_producto_antiguo == "") {
        order = await this.store.order(arg.id_producto);
      } else {
        order = await this.store.order(arg.id_producto, arg.id_producto_antiguo ? { oldPurchasedSkus: [arg.id_producto_antiguo] } : null);
      }
      console.log('order: ' + JSON.stringify(order));
    } catch (err) {
      console.log('Error Ordering ' + JSON.stringify(err));
    }   
  }

  async configurePurchasing(arg: any) {
    try {
      //this.store.verbosity = this.store.INFO;

      this.store.register({
        id: arg.id_producto,
        alias: arg.id_producto,
        type: this.store.PAID_SUBSCRIPTION,
      });

      this.registerHandlers(arg)

      this.store.ready((status) => {
        console.log('Store is Ready: ' + JSON.stringify(status));
      });

      this.store.when(arg.id_producto).error((error) => {
        console.log('An Error Occured' + JSON.stringify(error));
      });

      this.store.refresh();
    } catch (err) {
      console.log('Error On Store Issues' + JSON.stringify(err));
    }
  }

  registerHandlers(arg: any) {
    this.store.once(arg.id_producto).approved((product: IAPProduct) => {
      console.log('approved: ' + JSON.stringify(product));
      this.setSuscrpcionUsuario(product,arg);  
      product.finish();
    });

    this.store.when(arg.id_producto).registered((product: IAPProduct) => {
      console.log('Registered: ' + JSON.stringify(product));
    });

    this.store.when(arg.id_producto).updated((product: IAPProduct) => {
      console.log('Loaded' + JSON.stringify(product));          
    });

    this.store.when(arg.id_producto).cancelled((product: IAPProduct) => {
      console.log('Purchase was Cancelled');
    });

    this.store.once(arg.id_producto).owned((product: IAPProduct) => {
      console.log('awned: ' + JSON.stringify(product));
      this.setSuscrpcionUsuario(product,arg);      
    });

    this.store.error((err) => {
      console.log('Store Error ' + JSON.stringify(err));
    });
  }

  setSuscrpcionUsuario(product: any , arg : any) {
    let dispositivo: string = (this.dispositivo == true) ? 'android' : 'ios';
    let url: string = "servicio=setSuscrpcionUsuario";
    let data: any = {
      "id_usuario": this.globalProvider.usuario.id_usuario,
      "plataforma": dispositivo,
      "id_producto": product.id,
      "id_producto_antiguo":arg.id_producto_antiguo ,
      "token": product.transaction.purchaseToken
    };
    this.httpProvider.post(data, url).then(() => {
      this.getProductoUsuario();            
      this.globalProvider.setProductoId(product.id);
    }).catch(err => console.log('err: ' + JSON.stringify(err)));    
  }
}