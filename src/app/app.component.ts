import { Component } from '@angular/core';
import { Platform, ModalController, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { SmsPage } from '../pages/sms/sms';
import { ModalPage } from '../pages/modal/modal';

import { GlobalProvider, Idioma } from '../providers/global/global';
import { setMilisegundos, Fechas } from '../pipes/filtros/filtros';
import { HttpProvider } from '../providers/http/http';
import { CallLogObject } from '../model/interfaces';

import { Storage } from '@ionic/storage';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { CallLog } from '@ionic-native/call-log';
import { Push, PushObject, PushOptions } from '@ionic-native/push';
import { AppRate } from '@ionic-native/app-rate';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any;
  options: Array<CallLogObject>;
  set_milisegundos = new setMilisegundos();
  fechas = new Fechas();
  res = [];
  respuesta: any;
  notificaciones: Array<any> = [];

  constructor(
    private platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    private globalProvider: GlobalProvider,
    private storage: Storage,
    private androidPermissions: AndroidPermissions,
    private callLog: CallLog,
    private httpProvider: HttpProvider,
    private modalControlle: ModalController,
    private push: Push,
    private alertController: AlertController,
    private appRate: AppRate
  ) {
    this.getLenguajeUsuario();
    platform.ready().then(() => {
      statusBar.styleDefault();
      //this.globalProvider.getIdioma();
      if (platform.is('android')) {
        this.permisos();
      }
      this.initPushNotification();
      this.ranqui();
      this.storage.get('usuario').then(usuario => {
        if (usuario) {
          this.rootPage = HomePage;
          if (platform.is('android')) {
            this.historialTelefonico();
          }
        } else {
          this.rootPage = LoginPage;
        }
        splashScreen.hide();
      });
    });
  }

  private async permisos() {
    let list = [
      this.androidPermissions.PERMISSION.CALL_PHONE,
      this.androidPermissions.PERMISSION.READ_PHONE_STATE,
      this.androidPermissions.PERMISSION.WRITE_CALENDAR,
      this.androidPermissions.PERMISSION.READ_CONTACTS,
      this.androidPermissions.PERMISSION.WRITE_CONTACTS,
      this.androidPermissions.PERMISSION.GET_ACCOUNTS,
      this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE,
      this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE,
      this.androidPermissions.PERMISSION.SEND_SMS,
      this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION,
      this.androidPermissions.PERMISSION.CAMERA,
      this.androidPermissions.PERMISSION.READ_SMS
    ]
    const { hasPermission } = await this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CALL_PHONE);
    if (!hasPermission) {
      const result = await this.androidPermissions.requestPermissions(list);
      if (!result.hasPermission) {
        throw new Error('Permisos requeridos');
      }
      return;
    }
  }

  private historialTelefonico() {
    var hash = {};
    let numeros: Array<{ numero: string, fecha: string, tipo: string }> = [];
    this.storage.get('fecha').then(fecha => {
      this.options = [
        {
          name: 'date',
          value: fecha,
          operator: ">="
        }
      ];
      this.callLog.getCallLog(this.options).then(res => {
        this.res = res;
        this.res = this.res.filter(function (current) {
          var exists = !hash[current.number] || false;
          hash[current.number] = true;
          return exists;
        });
        for (let r of this.res) {
          if (r.type == 1 || r.type == 2 || r.type == 3) {
            let fecha = this.fechas.transform(this.set_milisegundos.transform(r.date));
            numeros.push({ numero: r.number, fecha: fecha, tipo: (r.type == 2) ? 'Lost call' : 'Made call' });
          }
        }
        let lg: string = (this.globalProvider.idioma) ? this.globalProvider.idioma.key : "en";
        let url = 'servicio=getIssetContactosTelefono';
        let data: Object = {
          id_usuario: this.globalProvider.usuario.id_usuario,
          fecha: this.fechas.transform(this.set_milisegundos.transform(fecha)),
          llamadas: numeros,
          lg: lg
        }
        this.httpProvider.post(data, url).then(res => {
          this.respuesta = res;
          if (this.respuesta.error == 'false') {
            if (this.respuesta.llamadas && this.respuesta.llamadas.length > 0) {
              let modal = this.modalControlle.create(ModalPage, { llamadas: this.respuesta.llamadas });
              modal.present();
            }
          }
        }).catch(err => console.log('err: ', err.toString()));
      }).catch(err => console.log('err: ', err.toString()));
    }).catch(err => console.log('err: ', err.toString()));
  }

  private initPushNotification() {
    this.push.hasPermission().then(res => {
      if (res.isEnabled) {
        console.log('We have permission to send push notifications');
      } else {
        console.log('We do not have permission to send push notifications');
      }
    }).catch(err => console.log('err: ', err.toString()));
    if (!this.platform.is('cordova')) {
      console.warn('Push notifications not initialized. Cordova is not available - Run in physical device');
      return;
    }
    const options: PushOptions = {
      android: {
        senderID: 'AIzaSyCtDffZZdDaJ3D99NGrovKac4cJuFlIZvs', forceShow: true
      },
      ios: {
        alert: 'true',
        badge: false,
        sound: 'true'
      },
      windows: {}
    };
    const pushObject: PushObject = this.push.init(options);

    pushObject.on('registration').subscribe((data: any) => {
      //console.log('device token -> ' + data.registrationId);
      this.globalProvider.setToken(data.registrationId);
    }, (err) => console.log('err: ' + JSON.stringify(err)));

    pushObject.on('notification').subscribe((data: any) => {
      if (data.additionalData.foreground) {
        let confirmAlert = this.alertController.create({
          title: 'New Notification',
          message: data.message,
          buttons: [{
            text: 'Ignore',
            role: 'cancel'
          }, {
            text: 'View',
            handler: () => {
              if (data.additionalData.id_campania_sms && data.additionalData.id_campania_sms != null) {
                let modal = this.modalControlle.create(SmsPage, { historial: true, campania_sms: null, id: data.additionalData.id_campania_sms });
                modal.present();
              }
            }
          }]
        });
        confirmAlert.present();
      } else {
        if (data.additionalData.id_campania_sms && data.additionalData.id_campania_sms != null) {
          let modal = this.modalControlle.create(SmsPage, { historial: true, campania_sms: null, id: data.additionalData.id_campania_sms });
          modal.present();
        }
      }
    });
    pushObject.on('error').subscribe(error => console.log('Error with Push plugin' + error));
  }

  private ranqui() {
    this.appRate.preferences = {
      displayAppName: 'AdvanSales',
      usesUntilPrompt: 2,
      promptAgainForEachNewVersion: true,
      inAppReview: false,
      storeAppURL: {
        ios: '1394472577',
        android: 'market://details?id=com.httpsAdvanSales.AdvanSales8'
      },
      callbacks: {
        onRateDialogShow: function (callback) {
          console.log('rate dialog shown!' + callback);
        },
        onButtonClicked: function (buttonIndex) {
          console.log('Selected index: -> ' + buttonIndex);
        }
      }
    };
    this.appRate.promptForRating(false);
  }

  private getLenguajeUsuario() {
    this.storage.get('id').then((idioma: Idioma) => {
      if (!idioma) {
        this.globalProvider.getLenguajeUsuario('en').catch(err => console.log('err: ', err.toString()));
      } else {
        this.globalProvider.idioma = { key: idioma.key, contenido: idioma.contenido };
      }
    }).catch(err => console.log('err: ', err.toString()));
  }
}
