import { Component } from '@angular/core';
import { NavController, App, ModalController, Platform, AlertController } from 'ionic-angular';

import { GlobalProvider } from '../../providers/global/global';
import { HttpProvider } from '../../providers/http/http';
import { PerfilPage } from '../perfil/perfil';

import { Numerico, Replace, Fecha, Hora, getMilisegundos, Diferencia } from '../../pipes/filtros/filtros';
import {  Persona , CampaniaSms, DataModal, HomeUtil } from '../../model/interfaces';
import { MyApp } from '../../app/app.component';
import { Plan } from '../../model/Usuario';

import { Storage } from '@ionic/storage';
import { CallNumber } from '@ionic-native/call-number';
import { Contacts, Contact, ContactField, ContactName, ContactOrganization } from '@ionic-native/contacts';
import { SMS } from '@ionic-native/sms';
import { Calendar } from '@ionic-native/calendar';
import { AdMobFree, AdMobFreeBannerConfig, AdMobFreeRewardVideoConfig } from '@ionic-native/admob-free';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  private getmilisegundos = new getMilisegundos();
  private diferencia = new Diferencia();
  private numerico = new Numerico();
  private replace = new Replace();
  private fecha = new Fecha();
  private hora = new Hora();
  private load: any;
  private res: any;
  private campanias: any;
  private conexion: boolean = false;
  private fila: any;
  private at_id_telefono: any;
  private at_id_sms_calendar: any;
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
    title: 'Waiting connection with pc ...',
    spinner: null,
    background: null,
    dispositivo: null,
  };

  constructor(
    public navCtrl: NavController,
    private globalProvider: GlobalProvider,
    private httpProvider: HttpProvider,
    private storage: Storage,
    private app: App,
    private modalControlle: ModalController,
    private platform: Platform,
    private callNumber: CallNumber,
    private contacts: Contacts,
    private sms: SMS,
    private calendar: Calendar,
    private alertController: AlertController,
    private admobFree: AdMobFree,
    private facebook: Facebook
  ) {
    this.plan = new Plan();
    this.home_util.dispositivo = this.platform.is('android');
  }

  ionViewDidLoad() {
    document.addEventListener(this.admobFree.events.REWARD_VIDEO_REWARD, (res) => {
      let creditos = res['rewardAmount'];
      let date = new Date();
      this.setBloqueoPublicidadUsuario('N', this.fecha.transform(date), this.hora.transform(date), creditos);
    });
    if (this.conexion == true) {
      this.platform.registerBackButtonAction(() => {
        this.monitoreo();
      });
    } else {
      this.platform.registerBackButtonAction(() => {
        this.platform.exitApp();
      });
    }
    this.isLogin();
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
        this.demo();
        if (usuario.mostrar_publicidad_video == 'Y') {
          this.prepareVideo();
          this.globalProvider.getTime();
        }
      }
    });
  }

  crearCampania(data: any = null) {
    if (this.bloqueo() == false) {
      let modal = this.modalControlle.create('CrearCampaniaPage', { data: data });
      modal.present();
      modal.onDidDismiss(data => {
        if (data) {
          this.getCampaniaUsuario();
        }
      });
    }
  }

  perfil() {
    this.navCtrl.push(PerfilPage);
  }

  getCampaniaUsuario() {
    let platform = (this.platform.is('ios')) ? 'ios' : 'android';
    if (this.inici == false) {
      this.load = this.globalProvider.cargando(this.globalProvider.data.msj.load);
    }
    let url = 'servicio=getCampaniaUsuario' +
      '&id_usuario=' + this.globalProvider.usuario.id_usuario +
      '&token=' + this.globalProvider.token +
      '&plataforma=' + platform;
    this.httpProvider.get(url).then(res => {
      if (this.inici == false) {
        this.load.dismiss();
      }
      this.res = res;
      if (this.res.error == 'false') {
        for (let index = 0; index < this.res.campania.length; index++) {
          this.edid_name.push({ edit: true, border: 'none', border_stado: ['none', 'none', 'none', 'none', 'none'], posicion_campania: index, stado: [false, false, false, false, false] });
        }
        for (let index = 0; index < this.res.manual.campania.length; index++) {
          this.edid_name_manual.push({ edit: true, border: 'none', border_stado: ['none', 'none', 'none', 'none', 'none'], posicion_campania: index, stado: [false, false, false, false, false] });
        }
        this.campanias = this.res.campania;
        this.manual = this.res.manual.campania;
        this.plan.gratis = (this.res.gratis == 'Y') ? true : false;
        this.plan.mostrar_publicidad_video = (this.res.mostrar_publicidad_video == 'Y') ? true : false;
        this.plan.mostrar_publicidad_banner = (this.res.mostrar_publicidad_banner == 'Y') ? true : false;
        this.plan.compartir_fb = (this.res.compartir_fb == 'Y') ? true : false;
        this.plan.plan = this.res.plan;
        this.plan.plan_fecha_expiracion = this.res.plan_fecha_expiracion;
        this.plan.plan_restriccion = (this.res.plan_restriccion == 'Y') ? true : false;
        this.plan.bloqueo = (this.res.bloqueo == 'Y') ? true : false;
        this.plan.bloqueo_msn = this.res.bloqueo_msn;
        this.plan.plan_restriccion_msn = this.res.plan_restriccion_msn;
        this.globalProvider.plan = this.plan;
        this.globalProvider.setPlan(this.globalProvider.plan);
        this.inici = false;
        if (this.res.log_out == 'Y') {
          this.globalProvider.deleteUsuario();
          this.globalProvider.getUsuario();
          this.app.getRootNav().setRoot(MyApp);
        }
        this.free();
      } else {
        this.globalProvider.alerta(this.res.mns);
      }
      if (this.globalProvider.plan.mostrar_publicidad_banner == true) {
        this.banner();
      }
    }).catch(err => {
      if (this.inici == false) {
        this.load.dismiss();
      }
      console.log('err: ' + JSON.stringify(err));
    });
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.getCampaniaUsuario();
      refresher.complete();
    });
  }

  irACampania(campania: any, posicion_campania: number, estado: number, posicion: number, tipo_campania: boolean = true) {
    if (this.bloqueo() == false) {
      if (this.sms_activo == false) {
        let modal = this.modalControlle.create('CampaniaPage', { campania: campania, posicion_campania: posicion_campania, estado: estado, posicion: posicion, tipo_campania: tipo_campania });
        modal.present();
        modal.onDidDismiss(data => {
          if (data) {
            this.getCampaniaUsuario();
          }
        });
      } else {
        if (tipo_campania == true) {
          this.edid_name[posicion_campania].stado[posicion] = !this.edid_name[posicion_campania].stado[posicion];
          (this.edid_name[posicion_campania].stado[posicion] == true) ? this.edid_name[posicion_campania].border_stado[posicion] = "solid gray 4px" : this.edid_name[posicion_campania].border_stado[posicion] = "none";
        } else {
          this.edid_name_manual[posicion_campania].stado[posicion] = !this.edid_name_manual[posicion_campania].stado[posicion];
          (this.edid_name_manual[posicion_campania].stado[posicion] == true) ? this.edid_name_manual[posicion_campania].border_stado[posicion] = "solid gray 4px" : this.edid_name_manual[posicion_campania].border_stado[posicion] = "none";
        }
      }
    }
  }

  monitoreo() {
    if (this.bloqueo() == false) {
      this.home_util.spinner = true;
      this.conexion = !this.conexion;
      if (this.conexion == true) {
        this.fila = setInterval(() => {
          this.setConexionTelefonoUsuario();
        }, 1000);
      } else {
        clearInterval(this.fila);
        this.setDesConexionTelefonoUsuario();
      }
      this.tiempoActual();
    }
  }

  setConexionTelefonoUsuario() {
    let url = 'servicio=setConexionTelefonoUsuario&id_usuario=' + this.globalProvider.usuario.id_usuario;
    this.httpProvider.get(url).then(res => {
      this.res = res;
      if (this.res.error == 'false') {
        this.home_util.spinner = false;
        this.getAccionTelefono();
        this.home_util.title = 'Established connection';
      }
    }).catch(err => console.log('err: ' + JSON.stringify(err)));
  }

  getAccionTelefono() {
    let url = 'servicio=getAccionTelefono&id_usuario=' + this.globalProvider.usuario.id_usuario;
    this.httpProvider.get(url).then(res => {
      this.res = res;
      if (this.res.error == 'false') {
        if (this.res.at_desconectar == 'N') {
          if (this.res.at_id_telefono) {
            if (this.res.at_id_telefono != this.at_id_telefono) {
              if (this.res.at_id_telefono != '0') {
                this.call(this.res.at_telefono, this.res.at_telefono_nombre_campania, this.res.at_telefono_nombre, true);
              }
            } else {
              if (this.res.at_telefono_volver_llamar == 'Y') {
                this.call(this.res.at_telefono);
              }
            }
            this.at_id_telefono = this.res.at_id_telefono;
          }
          if (this.at_id_sms_calendar != this.res.at_id_sms_calendar) {
            this.at_id_sms_calendar = this.res.at_id_sms_calendar;
            if (this.res.at_sms == 'Y') {
              this.setSms(this.res.at_sms_telefono, this.res.at_sms_telefono_text);
            }
            if (this.res.at_calendar == 'Y') {
              this.setCalendar(this.res);
            }
          }
        }
      }
    }).catch(err => console.log('err: ' + JSON.stringify(err)));
  }

  call(telefono: string, campania: string = null, nombre: string = null, nuevo: boolean = false) {
    if (this.validarTiempo() == true) {
      if (telefono != null && telefono.trim() != '') {
        this.callNumber.callNumber(telefono, true).then(res => {
          if (nuevo == true) {
            this.setContacto(telefono, nombre, campania);
          }
        });
      }
    }
  }

  setContacto(telefono: string, nombre: string, campania: string) {
    let contact: Contact = this.contacts.create();
    contact.name = new ContactName(null, nombre, 'AS');
    contact.nickname = campania;
    contact.organizations = [new ContactOrganization(null, campania, null)];
    contact.phoneNumbers = [new ContactField('mobile', this.numerico.transform(telefono))];
    contact.save().then(
      () => console.log('Contact saved!', contact),
      (error: any) => console.error('Error saving contact.', error)
    );
  }

  setSms(telefono: string, text: string) {
    this.sms.send(this.numerico.transform(telefono), text);
  }

  setCalendar(res: any) {
    this.res.at_calendar_fecha_hora, this.res.at_calendar_nota, this.res.at_calendar_titulo, this.res.at_telefono_nombre
    var startDate = new Date(this.replace.transform(res.at_calendar_fecha_hora));
    this.calendar.createEvent(
      res.at_calendar_titulo,
      'AdvanSales',
      'name: ' + res.at_telefono_nombre + ' , phone: ' + this.numerico.transform(res.res.at_telefono) + ' , note: ' + res.at_calendar_nota,
      startDate,
      startDate
    ).then(res => {
      console.log('success');
    }).catch(err => console.log('err: ' + JSON.stringify(err)));
  }

  setDesConexionTelefonoUsuario() {
    let url = 'servicio=setDesConexionTelefonoUsuario&id_usuario=' + this.globalProvider.usuario.id_usuario;
    this.httpProvider.get(url).then(res => {
      this.res = res;
      if (this.res.error == 'false') {
        this.home_util.title = 'Waiting connection with pc ...';
      }
    }).catch(err => console.log('err: ' + JSON.stringify(err)));
  }

  setDeleteCampania(id: number, nombre: string) {
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
            let url = 'servicio=setDeleteCampania&campania=' + id;
            this.httpProvider.get(url).then(res => {
              this.res = res;
              if (this.res.error == 'false') {
                this.removeContact(nombre);
                this.getCampaniaUsuario();
              } else {
                this.globalProvider.alerta(this.res.mns);
              }
            }).catch(err => console.log('err: ' + JSON.stringify(err)));
          }
        }
      ]
    });
    confirm.present();
  }

  setDeleteCampaniaManual(id: number) {
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
            let url = 'servicio=setDeleteCampaniaManual&id_campania_manual=' + id;
            this.httpProvider.get(url).then(res => {
              this.res = res;
              if (this.res.error == 'false') {
                this.getCampaniaUsuario();
              } else {
                this.globalProvider.alerta(this.res.mns);
              }
            }).catch(err => console.log('err: ' + JSON.stringify(err)));
          }
        }
      ]
    });
    confirm.present();
  }

  removeContact(nombre: string) {
    var options = {
      filter: "AS",
      organizations: nombre,
      nickname: nombre,
      multiple: true,
      hasPhoneNumber: true
    };
    this.contacts.find(["*"], options).then((res) => {
      this.res = res;
      //let hash = [];
      this.res = this.res.filter(function (current) {
        var exists = current.nickname == nombre;
        return exists;
      });
      for (let r of this.res) {
        r.remove();
      }
    });
  }

  share() {
    var url: string;
    if (this.platform.is('android')) {
      url = 'https://advansalesapp.page.link/android';
    }
    if (this.platform.is('ios')) {
      url = 'https://advansalesapp.page.link/ios';
    }
    this.facebook.login(['email', 'public_profile']).then((response: FacebookLoginResponse) => {
      this.facebook.showDialog({
        method: "share",
        href: url,
        caption: '',
        description: '',
        picture: ''
      }).then(res => {
        let date = new Date();
        let url = 'servicio=setMostrarPublicidadUsuario' +
          '&id_usuario=' + this.globalProvider.usuario.id_usuario +
          '&fecha=' + this.fecha.transform(date) +
          '&hora=' + this.hora.transform(date);
        this.httpProvider.get(url).then(res => {
          this.res = res;
          if (this.res.error == 'false') {
            let date = new Date(this.res.tiempo_usuario);
            this.globalProvider.setTime(this.getmilisegundos.transform(date));
            this.plan.gratis = (this.res.gratis == 'Y') ? true : false;
            this.plan.mostrar_publicidad_video = (this.res.mostrar_publicidad_video == 'Y') ? true : false;
            this.plan.mostrar_publicidad_banner = (this.res.mostrar_publicidad_banner == 'Y') ? true : false;
            this.plan.compartir_fb = (this.res.compartir_fb == 'Y') ? true : false;
            this.plan.plan = this.res.plan;
            this.plan.plan_fecha_expiracion = this.res.plan_fecha_expiracion;
            this.plan.plan_restriccion = (this.res.plan_restriccion == 'Y') ? true : false;
            this.plan.bloqueo = (this.res.bloqueo == 'Y') ? true : false;
            this.plan.bloqueo_msn = this.res.bloqueo_msn;
            this.plan.plan_restriccion_msn = this.res.plan_restriccion_msn;
            this.globalProvider.plan = this.plan;
            this.globalProvider.setPlan(this.globalProvider.plan);
          }
        }).catch(err => console.log('err: ' + JSON.stringify(err)));
      }).catch(err => console.log('share' + JSON.stringify(err)));
    }).catch(e => console.log('face: ' + JSON.stringify(e)));
  }

  free() {
    if (this.plan.gratis == true && this.plan.compartir_fb == false) {
      let alert = this.alertController.create({
        title: '',
        subTitle: 'Make a publication so that the application is free!',
        buttons: ['Ok']
      });
      alert.present();
      this.home_util.compartir = true;
    } else {
      this.home_util.compartir = false;
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
    let url = "servicio=setDatosEditCampania" +
      "&id_campania=" + id +
      "&nombre=" + name;
    this.httpProvider.get(url).then(res => {
      this.res = res;
    }).catch(err => console.log('err: ' + JSON.stringify(err)));
  }

  setDatosEditCampaniaManual(id: number, name: string, i: number) {
    this.editNameManual(i);
    let url = "servicio=setDatosEditCampaniaManual" +
      "&id_campania_manual=" + id +
      "&nombre=" + name;
    this.httpProvider.get(url).then(res => {
      this.res = res;
    }).catch(err => console.log('err: ' + JSON.stringify(err)));
  }

  selectSms() {
    if (this.bloqueo() == false) {
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
        subTitle: 'You need to select a minimum of 1 list to create a SMS bulk campaign',
        buttons: ['Ok']
      });
      alert.present();
      return false;
    }
    let modal = this.modalControlle.create('SmsPage', { historial: historial, campania_sms: this.campania_sms, id: null });
    modal.present();
    modal.onDidDismiss(data => {
      if (data) {
        this.selectSms();
        this.getCampaniaUsuario();
      }
    });
  }

  demo() {
    this.storage.get('num').then(num => {
      if (num && num != null && num == 1) {
        let data: DataModal = { view: 2, num: num, imagenes: null }
        let modal = this.modalControlle.create('ModalPage', { data: data });
        modal.present();
        modal.onDidDismiss(data => {
          if (data) {
            this.selectSms();
            this.getCampaniaUsuario();
          }
        });
      }
    });  
  }

  bloqueo() {
    if (this.plan.bloqueo == true) {
      let alert = this.alertController.create({
        title: '',
        subTitle: this.plan.bloqueo_msn,
        buttons: ['Ok']
      });
      alert.present();
      return true;
    }
    return false
  }
}