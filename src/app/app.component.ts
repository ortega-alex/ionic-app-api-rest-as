import { Component } from '@angular/core';
import { Platform, ModalController, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';

import { GlobalProvider } from '../providers/global/global';
import { setMilisegundos, Fechas } from '../pipes/filtros/filtros';
import { HttpProvider } from '../providers/http/http';
import { CallLogObject, DataModal } from '../model/interfaces';

import { Storage } from '@ionic/storage';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { CallLog } from '@ionic-native/call-log';
import { Push, PushObject, PushOptions } from '@ionic-native/push';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  private rootPage: any;
  private options: Array<CallLogObject>;
  private set_milisegundos = new setMilisegundos();
  private fechas = new Fechas();
  private res = [];
  private respuesta: any;

  constructor(
    private platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    private globalProvider: GlobalProvider,
    private storage: Storage,
    private androidPermissions: AndroidPermissions,
    private callLog: CallLog,
    private httProvider: HttpProvider,
    private modalControlle: ModalController,
    private push: Push,
    private alertController: AlertController
  ) {
    platform.ready().then(() => {
      statusBar.styleDefault();
      if (platform.is('android')) {
        this.permisos();
      }
      this.storage.get('usuario').then(usuario => {
        if (usuario) {
          this.rootPage = HomePage;
          if (platform.is('android')) {
            this.historialTelefonico();
          }
        } else {
          this.rootPage = LoginPage;
        }
      });
      splashScreen.hide();
      this.initPushNotification();
    });
  }

  async permisos() {
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
      this.androidPermissions.PERMISSION.CAMERA
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

  historialTelefonico() {
    let d: DataModal = { view: 1, num: null, imagenes: null };
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
        let url = 'servicio=getIssetContactosTelefono';
        let data = {
          id_usuario: this.globalProvider.usuario.id_usuario,
          fecha: this.fechas.transform(this.set_milisegundos.transform(fecha)),
          llamadas: numeros
        }
        this.httProvider.post(data, url).then(res => {
          this.respuesta = res;
          if (this.respuesta.error == 'false') {
            if (this.respuesta.llamadas && this.respuesta.llamadas.length > 0) {
              let modal = this.modalControlle.create('ModalPage', { llamadas: this.respuesta.llamadas, data: d });
              modal.present();
            }
          }
        }).catch(err => console.log('err http: ' + JSON.stringify(err)));
      }).catch(err => console.log('err calLog: ' + JSON.stringify(err)));
    }).catch(err => console.log('err storage: ' + JSON.stringify(err)));
  }

  initPushNotification() {
    this.push.hasPermission().then(res => {
      if (res.isEnabled) {
        console.log('We have permission to send push notifications');
      } else {
        console.log('We do not have permission to send push notifications');
      }
    }).catch(err => console.log('err: ' + JSON.stringify(err)));
    if (!this.platform.is('cordova')) {
      console.warn('Push notifications not initialized. Cordova is not available - Run in physical device');
      return;
    }
    const options: PushOptions = {
      android: {
        senderID: 'AIzaSyCtDffZZdDaJ3D99NGrovKac4cJuFlIZvs'
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
                let modal = this.modalControlle.create('SmsPage', { historial: true, campania_sms: null, id: data.additionalData.id_campania_sms });
                modal.present();
              }
            }
          }]
        });
        confirmAlert.present();
      } else {
        if (data.additionalData.id_campania_sms && data.additionalData.id_campania_sms != null) {
          let modal = this.modalControlle.create('SmsPage', { historial: true, campania_sms: null, id: data.additionalData.id_campania_sms });
          modal.present();
        }
      }
    });
    pushObject.on('error').subscribe(error => console.error('Error with Push plugin' + error));
  }

  nada(){
    console.log('rootPage: ' + this.rootPage);
  }
}