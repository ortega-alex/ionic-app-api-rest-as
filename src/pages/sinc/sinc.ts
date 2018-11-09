import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, Platform } from 'ionic-angular';
import { GlobalProvider } from '../../providers/global/global';
import { HttpProvider } from '../../providers/http/http';
import { Calendario } from '../../model/interfaces';
import { FunctionProvider } from '../../providers/function/function';

@IonicPage()
@Component({
  selector: 'page-sinc',
  templateUrl: 'sinc.html',
})
export class SincPage {

  title: string;
  private fila: any;
  spinner: boolean;
  private at_id_telefono: string;
  compartir: boolean;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private viewController: ViewController,
    private platform: Platform,
    private globalProvider: GlobalProvider,
    private httpProvider: HttpProvider,
    private functionProvider: FunctionProvider
  ) {
    this.title = '_waitingConnection';
    this.spinner = true;
    this.compartir = this.navParams.get("compartir");
  }

  ionViewDidLoad() {
    this.setConexionTelefonoUsuario()
    this.fila = setInterval(() => {
      this.getAccionTelefono();
    }, 1000);
    this.platform.registerBackButtonAction(() => {
      this.closeModal();
    });
  }

  ionViewWillUnload() {
    this.platform.registerBackButtonAction(() => {
      this.platform.exitApp();
    });
  }

  closeModal() {
    clearInterval(this.fila);
    this.setDesConexionTelefonoUsuario();
    this.viewController.dismiss()
  }

  setConexionTelefonoUsuario() {
    let url: string = 'servicio=setConexionTelefonoUsuario&id_usuario=' + this.globalProvider.usuario.id_usuario +
      '&lg=' + this.globalProvider.idioma.key;
    this.httpProvider.get(url).then((res: any) => {
      if (res.error == 'false') {
        this.spinner = false;
        this.title = '_establishedConnection';
      }
    }).catch(err => console.log('err: ', err.toString()));
  }

  getAccionTelefono() {
    let url: string = 'servicio=getAccionTelefono&id_usuario=' + this.globalProvider.usuario.id_usuario +
      '&lg=' + this.globalProvider.idioma.key;
    this.httpProvider.get(url).then((res: any) => {
      if (res.error == 'false') {
        if (res.at_desconectar == 'N') {
          if (res.at_id_telefono) {
            if (res.at_id_telefono != this.at_id_telefono) {
              if (res.at_id_telefono != '0') {
                this.functionProvider.call(res.at_telefono, res.at_telefono_nombre_campania, res.at_telefono_nombre, true);
              }
            } else {
              if (res.at_telefono_volver_llamar == 'Y') {
                this.functionProvider.call(res.at_telefono);
              }
            }
            this.at_id_telefono = res.at_id_telefono;
          }
          if (res.at_sms == 'Y') {
            this.functionProvider.setSms(res.at_sms_telefono, res.at_sms_telefono_text);
          }
          if (res.at_calendar == 'Y') {
            let calendario: Calendario = {
              fecha: res.at_calendar_fecha_hora,
              nombre: res.at_telefono_nombre,
              nota: res.at_calendar_nota,
              telefono: res.at_telefono,
              titulo: res.at_calendar_titulo
            }
            this.functionProvider.setCalendar(calendario);
          }
        }
      }
    }).catch(err => console.log('err: ' + err.toString()));
  }

  setDesConexionTelefonoUsuario() {
    let url = 'servicio=setDesConexionTelefonoUsuario' +
      '&id_usuario=' + this.globalProvider.usuario.id_usuario +
      '&lg=' + this.globalProvider.idioma.key;
    this.httpProvider.get(url).then((res: any) => {
      if (res.error == 'false') {
        this.title = 'Waiting connection with pc ...';
      }
    }).catch(err => console.log('err: ', err.toString()));
  }
}
