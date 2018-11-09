import { Component } from '@angular/core';
import { NavController, App, ModalController, Platform, AlertController } from 'ionic-angular';

import { SocialPage } from '../social/social';
import { ProductoPage } from '../producto/producto';
import { VcardPage } from '../vcard/vcard';
import { TutorialPage } from '../tutorial/tutorial';
import { AgendaPage } from '../agenda/agenda';
import { CrearCampaniaPage } from '../crear-campania/crear-campania';
import { SmsPage } from '../sms/sms';

import { GlobalProvider } from '../../providers/global/global';
import { HttpProvider } from '../../providers/http/http';
import { Fecha, Hora, Diferencia } from '../../pipes/filtros/filtros';
import { Persona, CampaniaSms, HomeUtil } from '../../model/interfaces';
import { MyApp } from '../../app/app.component';
import { Plan } from '../../model/Usuario';

import { Storage } from '@ionic/storage';
import { AdMobFree, AdMobFreeBannerConfig, AdMobFreeRewardVideoConfig } from '@ionic-native/admob-free';
import { CampaniaPage } from '../campania/campania';
import { SincPage } from '../sinc/sinc';
import { FunctionProvider } from '../../providers/function/function';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {

  private diferencia = new Diferencia();
  private fecha = new Fecha();
  private hora = new Hora();
  private load: any;
  private campanias: Array<any>;
  private inici: boolean = true;
  private segundos: number = 10;
  private timer: any;
  private time: { hora: number, minuto: number, segundo: number };
  private tiempo_restante: any;
  private edid_name: Array<Persona> = [];
  private edid_name_manual: Array<Persona> = [];
  private sms_activo: boolean = false;
  private campania_sms: Array<CampaniaSms> = [];
  private plan: Plan;
  private manual: Array<any> = [];
  private home_util: HomeUtil = {
    compartir: null,
    title: '_waitingConnection',
    spinner: null,
    background: null,
  };
  menu: boolean;
  campaniaSMS: Array<any>;
  sin_campanias: boolean;
  private version: string = "2.2.8";

  constructor(
    public navCtrl: NavController,
    private globalProvider: GlobalProvider,
    private httpProvider: HttpProvider,
    private storage: Storage,
    private app: App,
    private modalControlle: ModalController,
    private platform: Platform,
    private alertController: AlertController,
    private admobFree: AdMobFree,
    private functionProvider: FunctionProvider
  ) {
    this.plan = new Plan();
    this.menu = false;
    this.campanias = [];
  }

  ionViewDidLoad() {
    document.addEventListener(this.admobFree.events.REWARD_VIDEO_REWARD, (res) => {
      let creditos = res['rewardAmount'];
      let date = new Date();
      this.globalProvider.setBloqueoPublicidadUsuario('N', this.fecha.transform(date), this.hora.transform(date), creditos);
    });

    this.platform.registerBackButtonAction(() => {
      this.platform.exitApp();
    });

    this.isLogin();
    this.tiempoActual();
    this.campaniaSMS = [];
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
    this.timer = setInterval(() => {
      this.tick();
    }, 1000);
    this.admobFree.rewardVideo.prepare().then(() => {
      this.prepareVideo();
    }).catch((err) => {
      throw new Error(err);
    });
  }

  banner() {
    const bannerConfig: AdMobFreeBannerConfig = {
      id: 'ca-app-pub-9573570332340263/7605313113',
      isTesting: false,
      autoShow: true
    };
    this.admobFree.banner.config(bannerConfig);
    this.admobFree.banner.prepare().then(() => {
    }).catch(err => console.log('err: ' + JSON.stringify(err)));
  }

  isLogin() {
    this.storage.get('usuario').then(usuario => {
      if (!usuario) {
        this.app.getRootNav().setRoot(MyApp);
      } else {
        this.getCampaniaUsuario();
        if (usuario.mostrar_publicidad_video == 'Y') {
          this.prepareVideo();
          this.globalProvider.getTime();
        }
      }
    });
  }

  crearCampania(data: any = null) {
    let modal = this.modalControlle.create(CrearCampaniaPage, { data: data });
    modal.present();
    modal.onDidDismiss(data => {
      if (data) {
        this.getCampaniaUsuario();
      }
    });
  }

  getCampaniaUsuario() {
    this.getCampaniaSMSUsuario();
    //let platform = (this.platform.is('ios')) ? 'ios' : 'android';
    let platform = (this.globalProvider.dispositivo == true) ? 'android' : 'ios';
    if (this.inici == false) {
      this.load = this.globalProvider.cargando(this.globalProvider.data.msj.load);
    }
    let lg: string = (this.globalProvider.idioma) ? this.globalProvider.idioma.key : 'en';
    let url: string = 'servicio=getCampaniaUsuario' +
      '&id_usuario=' + this.globalProvider.usuario.id_usuario +
      '&token=' + this.globalProvider.token +
      '&plataforma=' + platform +
      '&lg=' + lg;
    this.httpProvider.get(url).then((res: any) => {
      if (this.inici == false) {
        this.load.dismiss();
      }
      if (res.error == 'false') {
        for (let index = 0; index < res.campania.length; index++) {
          this.edid_name.push({ edit: true, border: 'none', border_stado: ['none', 'none', 'none', 'none', 'none'], posicion_campania: index, stado: [false, false, false, false, false] });
        }
        for (let index = 0; index < res.manual.campania.length; index++) {
          this.edid_name_manual.push({ edit: true, border: 'none', border_stado: ['none', 'none', 'none', 'none', 'none'], posicion_campania: index, stado: [false, false, false, false, false] });
        }

        this.campanias = res.campania;
        this.manual = res.manual.campania;

        if (this.campanias.length == 0 && this.manual.length == 0) {
          this.sin_campanias = true;
        } else {
          this.sin_campanias = false;
        }

        this.plan.gratis = res.gratis;
        this.plan.mostrar_publicidad_video = res.mostrar_publicidad_video;
        this.plan.mostrar_publicidad_banner = res.mostrar_publicidad_banner;
        this.plan.compartir_fb = res.compartir_fb;
        this.plan.plan = res.plan;
        this.plan.plan_fecha_expiracion = res.plan_fecha_expiracion;
        this.plan.plan_restriccion = res.plan_restriccion;
        this.plan.bloqueo = res.bloqueo;
        this.plan.bloqueo_msn = res.bloqueo_msn;
        this.plan.plan_restriccion_msn = res.plan_restriccion_msn;
        this.plan.suscrito = res.suscrito;
        this.plan.activo = res.plan;
        this.plan.leads = res.leads;
        this.plan.sms_leads = res.sms_leads;
        this.plan.suscripcion_error_msn = res.suscripcion_error_msn;
        this.plan.advanvcard = res.advanvcard;
        this.plan.leads_msn = res.leads_msn;
        this.plan.leads_sms_msn = res.leads_sms_msn;
        this.plan.advansocial_msn = res.advansocial_msn;
        this.plan.advandocs_msn = res.advandocs_msn;
        this.plan.advanvcard_msn = res.advanvcard_msn;
        this.plan.advansocial = res.advansocial;

        this.globalProvider.plan = this.plan;
        this.globalProvider.setPlan(this.globalProvider.plan);

        this.inici = false;

        if (res.log_out == 'Y') {
          this.globalProvider.deleteUsuario();
          this.globalProvider.getUsuario();
          this.app.getRootNav().setRoot(MyApp);
        }

        this.home_util.compartir = this.globalProvider.free();

        if (res.version_app != this.version) {
          this.alertVersion(res.version_app_msn);
        }

        if (res.cargar_app_lenguaje == 'Y') {
          this.setCargaAppLenguaje()
        }

        if (res.delete_contacto && res.delete_contacto.length > 0) {
          this.functionProvider.removeContact(null, res.delete_contacto)
        }

      } else {
        this.globalProvider.alerta(res.mns);
      }
      if (this.globalProvider.plan.mostrar_publicidad_banner == 'Y') {
        this.banner();
      }
    }).catch(err => {
      if (this.inici == false) {
        this.load.dismiss();
      }
      console.log('err: ', err.toString());
    });
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.getCampaniaUsuario();
      refresher.complete();
    });
  }

  irACampania(campania: any, posicion_campania: number, estado: number, posicion: number, tipo_campania: boolean = true) {
    if (this.globalProvider.bloqueo() == false) {
      if (this.sms_activo == false) {
        let modal = this.modalControlle.create(CampaniaPage, { campania: campania, posicion_campania: posicion_campania, estado: estado, posicion: posicion, tipo_campania: tipo_campania });
        modal.present();
        modal.onDidDismiss(data => {
          if (data) {
            this.getCampaniaUsuario();
          }
        });
      } else {
        if (tipo_campania == true) {
          this.edid_name[posicion_campania].stado[posicion] = !this.edid_name[posicion_campania].stado[posicion];
          (this.edid_name[posicion_campania].stado[posicion] == true) ? this.edid_name[posicion_campania].border_stado[posicion] = "solid white 4px" : this.edid_name[posicion_campania].border_stado[posicion] = "none";
        } else {
          this.edid_name_manual[posicion_campania].stado[posicion] = !this.edid_name_manual[posicion_campania].stado[posicion];
          (this.edid_name_manual[posicion_campania].stado[posicion] == true) ? this.edid_name_manual[posicion_campania].border_stado[posicion] = "solid white 4px" : this.edid_name_manual[posicion_campania].border_stado[posicion] = "none";
        }
      }
    }
  }

  drawSinc() {
    this.navCtrl.push(SincPage, { compartir: this.home_util.compartir });
  }

  setDeleteCampania(id: number, nombre: string, manual: boolean = false) {
    let url: string;
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
            if (manual == false) {
              url = 'servicio=setDeleteCampania&campania=' + id;
            } else {
              url = 'servicio=setDeleteCampaniaManual&id_campania_manual=' + id;
            }
            url += '&lg=' + this.globalProvider.idioma.key
            this.httpProvider.get(url).then((res: any) => {
              if (res.error == 'false') {
                if (manual == false) {
                  this.functionProvider.removeContact(nombre);
                  this.getCampaniaUsuario();
                } else {
                  this.getCampaniaUsuario();
                }
              } else {
                this.globalProvider.alerta(res.mns);
              }
            }).catch(err => console.log('err: ', err.toString()));
          }
        }
      ]
    });
    confirm.present();
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

  editName(i: number, propietario: string) {
    if (propietario == 'Y') {
      this.edid_name[i].edit = !this.edid_name[i].edit;
      (this.edid_name[i].edit == false) ? this.edid_name[i].border = 'solid green 1px' : this.edid_name[i].border = 'none';
    }
  }

  editNameManual(i: number) {
    this.edid_name_manual[i].edit = !this.edid_name_manual[i].edit;
    (this.edid_name_manual[i].edit == false) ? this.edid_name_manual[i].border = 'solid green 1px' : this.edid_name_manual[i].border = 'none';
  }

  setDatosEditCampania(id: number, name: string, i: number) {
    let url: string = "servicio=setDatosEditCampania" +
      "&id_campania=" + id +
      "&nombre=" + name +
      "&lg=" + this.globalProvider.idioma.key;
    this.httpProvider.get(url).then(() => {
      console.log('success');
    }).catch(err => console.log('err: ', err.toString()));
  }

  setDatosEditCampaniaManual(id: number, name: string, i: number) {
    this.editNameManual(i);
    let url: string = "servicio=setDatosEditCampaniaManual" +
      "&id_campania_manual=" + id +
      "&nombre=" + name +
      "&lg=" + this.globalProvider.idioma.key;
    this.httpProvider.get(url).then(() => {
      console.log('success');
    }).catch(err => console.log('err: ', err.toString()));
  }

  selectSms() {
    if (this.globalProvider.bloqueo() == false) {
      this.sms_activo = !this.sms_activo;
      if (this.sms_activo == true) {
        this.home_util.background = "lightgray";
      } else {
        this.home_util.background = "";
        this.campania_sms = [];
        for (let i = 0; i < this.edid_name.length; i++) {
          for (let j = 0; j < this.edid_name[i].border_stado.length; j++) {
            if (this.edid_name[i].border_stado[j] != 'none') {
              this.edid_name[i].border_stado[j] = 'none';
            }
            if (this.edid_name[i].stado[j] != false) {
              this.edid_name[i].stado[j] = false;
            }
          }
        }
        for (let i = 0; i < this.edid_name_manual.length; i++) {
          for (let j = 0; j < this.edid_name_manual[i].border_stado.length; j++) {
            if (this.edid_name_manual[i].border_stado[j] != 'none') {
              this.edid_name_manual[i].border_stado[j] = 'none';
            }
            if (this.edid_name_manual[i].stado[j] != false) {
              this.edid_name_manual[i].stado[j] = false;
            }
          }
        }
      }
    }
  }

  selectCamapniaSms() {
    var si: boolean = false;
    for (let i = 0; i < this.edid_name.length; i++) {
      for (let j = 0; j < this.edid_name[i].stado.length; j++) {
        if (this.edid_name[i].stado[j] == true) {
          if (this.campania_sms && this.campania_sms.length > 0) {
            for (let k = 0; k < this.campania_sms.length; k++) {
              if (this.campania_sms[k].id_campania == this.campanias[this.edid_name[i].posicion_campania].id_campania && this.campania_sms[k].tipo_campania == 1) {
                this.campania_sms[k].estados.push(
                  {
                    color: this.campanias[this.edid_name[i].posicion_campania].estados_llamadas[j].color,
                    id: this.campanias[this.edid_name[i].posicion_campania].estados_llamadas[j].key_estado,
                    valor: this.campanias[this.edid_name[i].posicion_campania].estados_llamadas[j].valor,
                    texto: this.campanias[this.edid_name[i].posicion_campania].estados_llamadas[j].texto,
                  }
                );
                si = true;
              } else {
                si = false;
              }
            }
          }
          if (si == false) {
            var estados = [];
            estados.push({
              color: this.campanias[this.edid_name[i].posicion_campania].estados_llamadas[j].color,
              id: this.campanias[this.edid_name[i].posicion_campania].estados_llamadas[j].key_estado,
              valor: this.campanias[this.edid_name[i].posicion_campania].estados_llamadas[j].valor,
              texto: this.campanias[this.edid_name[i].posicion_campania].estados_llamadas[j].texto,
            });
            this.campania_sms.push(
              {
                id_campania: this.campanias[this.edid_name[i].posicion_campania].id_campania,
                nombre: this.campanias[this.edid_name[i].posicion_campania].nombre,
                tipo_campania: 1,
                estados: estados,
                togglel: false
              }
            );
          }
        }
      }
    }
  }

  selectCamapniaManualSms() {
    var si: boolean = false;
    for (let i = 0; i < this.edid_name_manual.length; i++) {
      for (let j = 0; j < this.edid_name_manual[i].stado.length; j++) {
        if (this.edid_name_manual[i].stado[j] == true) {
          if (this.campania_sms && this.campania_sms.length > 0) {
            for (let k = 0; k < this.campania_sms.length; k++) {
              if (this.campania_sms[k].id_campania == this.manual[this.edid_name_manual[i].posicion_campania].id_campania_manual && this.campania_sms[k].tipo_campania == 2) {
                this.campania_sms[k].estados.push(
                  {
                    color: this.manual[this.edid_name_manual[i].posicion_campania].estados_llamadas[j].color,
                    id: this.manual[this.edid_name_manual[i].posicion_campania].estados_llamadas[j].key_estado,
                    valor: this.manual[this.edid_name_manual[i].posicion_campania].estados_llamadas[j].valor,
                    texto: this.manual[this.edid_name_manual[i].posicion_campania].estados_llamadas[j].texto,
                  }
                );
                si = true;
              } else {
                si = false;
              }
            }
          }
          if (si == false) {
            var estados = [];
            estados.push({
              color: this.manual[this.edid_name_manual[i].posicion_campania].estados_llamadas[j].color,
              id: this.manual[this.edid_name_manual[i].posicion_campania].estados_llamadas[j].key_estado,
              valor: this.manual[this.edid_name_manual[i].posicion_campania].estados_llamadas[j].valor,
              texto: this.manual[this.edid_name_manual[i].posicion_campania].estados_llamadas[j].texto,
            });
            this.campania_sms.push(
              {
                id_campania: this.manual[this.edid_name_manual[i].posicion_campania].id_campania_manual,
                nombre: this.manual[this.edid_name_manual[i].posicion_campania].nombre,
                tipo_campania: 2,
                estados: estados,
                togglel: false
              }
            );
          }
        }
      }
    }
  }

  smsModal(historial: boolean = false) {
    if (historial == false) {
      this.selectCamapniaSms();
      this.selectCamapniaManualSms();
    }
    if (historial == false && this.campania_sms.length == 0) {
      let alert = this.alertController.create({
        title: '',
        subTitle: this.globalProvider.idioma.contenido['_warningListSms'],
        buttons: ['Ok']
      });
      alert.present();
      return false;
    }
    let modal = this.modalControlle.create(SmsPage, { historial: historial, campania_sms: this.campania_sms, id: null });
    modal.present();
    modal.onDidDismiss(data => {
      if (data) {
        this.selectSms();
        this.getCampaniaUsuario();
      }
    });
  }

  drawSocial() {
    this.navCtrl.push(SocialPage);
  }

  drawProductos() {
    this.navCtrl.push(ProductoPage);
  }

  drawVcard() {
    this.navCtrl.push(VcardPage);
  }

  getCampaniaSMSUsuario() {
    let url: string = "servicio=getCampaniaSMSUsuario&id_usuario=" + this.globalProvider.usuario.id_usuario +
      "&lg=" + this.globalProvider.idioma.key;
    this.httpProvider.get(url).then((res: any) => {
      if (res.error == 'false') {
        this.campaniaSMS = res.campaniaSMS;
      }
    }).catch(err => console.log('err: ', err.toString()));
  }

  drawTutorials() {
    this.navCtrl.push(TutorialPage);
  }

  drawAgenda() {
    let modal = this.modalControlle.create(AgendaPage);
    modal.present();
    modal.onDidDismiss(res => {
      if (res == true) {
        this.getCampaniaUsuario();
      }
    });
  }

  private alertVersion(msj: string) {
    let url: string;
    let alert = this.alertController.create({
      title: this.globalProvider.idioma.contenido['_newVersion'],
      subTitle: msj,
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            if (this.platform.is('android')) {
              url = 'https://play.google.com/store/apps/details?id=com.httpsAdvanSales.AdvanSales8';
            }
            if (this.platform.is('ios')) {
              url = 'https://itunes.apple.com/us/app/advansales/id1394472577?l=es&ls=1&mt=8';
            }
            window.location.href = url;
          }
        }
      ]
    });
    alert.present();
  }

  private setCargaAppLenguaje() {
    let id = (this.globalProvider.idioma) ? this.globalProvider.idioma.key : 'en';
    this.globalProvider.getLenguajeUsuario(id).then(() => {
      let url: string = "servicio=setCargaAppLenguaje&id_usuario=" + this.globalProvider.usuario.id_usuario;
      this.httpProvider.get(url).catch(err => console.log('err: ', err.toString()));
    }).catch(err => console.log('err: ', err.toString()))
  }
}