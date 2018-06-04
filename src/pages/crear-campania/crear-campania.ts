import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, PopoverController, Platform, Alert, AlertController, ModalController } from 'ionic-angular';

import { GlobalProvider } from '../../providers/global/global';
import { HttpProvider } from '../../providers/http/http';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';

import { FileChooser } from '@ionic-native/file-chooser';
import { FilePath } from '@ionic-native/file-path';
import { File } from '@ionic-native/file';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { IOSFilePicker } from '@ionic-native/file-picker';
import { CallNumber } from '@ionic-native/call-number';
import { Numerico, FechaPosterios } from '../../pipes/filtros/filtros';
import { SMS } from '@ionic-native/sms';
import { Calendar } from '@ionic-native/calendar';

@IonicPage()
@Component({
  selector: 'page-crear-campania',
  templateUrl: 'crear-campania.html',
})
export class CrearCampaniaPage {

  private ordenarCampania: FormGroup;
  private submitted: boolean = false;
  private datos = [];
  private load: any;
  private res: any;
  private mostrar: boolean = false;
  private id_pre_campania: any;
  private columna = [
    { c: null, r: true },
    { c: null, r: true },
    { c: null, r: true },
    { c: null, r: true },
  ];
  private nombre_archivo: any;
  private msnS: boolean = false;
  private sms: string = 'N';
  private sms_tex: string = '';
  private campania_blanco: boolean = false;
  private numeros: Array<number> = [];
  private fechaPosterios = new FechaPosterios();
  private numerico = new Numerico();
  private panel: boolean = false;
  private catalogoEstado: any;
  private new_campania: { nombre_campania: string, telefono: string, nombre: string, fecha: string, sms: boolean, sms_tex: string, nota: string, campos: { uno: string, dos: string } }

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private transfer: FileTransfer,
    private globalProvider: GlobalProvider,
    private httpProvider: HttpProvider,
    private formBuilder: FormBuilder,
    private viewController: ViewController,
    private popoverController: PopoverController,
    private platform: Platform,
    private fileChooser: FileChooser,
    private filePath: FilePath,
    private file: File,
    private iosFilePicker: IOSFilePicker,
    private alertController: AlertController,
    private callNumber: CallNumber,
    private modalController: ModalController,
    private Sms:SMS,
    private calendar:Calendar
  ) {
    this.new_campania = { nombre_campania: null, telefono: '', nombre: null, fecha: null, sms: true, sms_tex: null, nota: null, campos: { uno: null, dos: null } };

    this.ordenarCampania = this.formBuilder.group({
      nombreArchivo: [''],
      nombreCampania: ['', Validators.required],
      telefono: ['', Validators.required],
      nombre: ['', Validators.required],
      c1Nombre: [''],
      c1: [''],
      c2Nombre: [''],
      c2: [''],
      c3Nombre: [''],
      c3: [''],
      c4Nombre: [''],
      c4: [''],
      sms_predeterminado: ['']
    });
  }

  ionViewDidLoad() {
    this.platform.registerBackButtonAction(() => {
      this.cancelar();
    });
  }

  ionViewWillUnload() {
    this.platform.registerBackButtonAction(() => {
      this.platform.exitApp();
    });
  }

  tem() {
    let url = "servicio=setExcelUsuario&id_usuario=" + 3;
    this.httpProvider.get(url).then(res => {
      this.res = res;
      if (this.res.encabezado) {
        this.datos = this.res.encabezado;
        this.id_pre_campania = this.res.id_pre_campania;
        this.mostrar = true;
      } else {
        this.globalProvider.alerta(this.res.msn);
      }
    }).catch(err => console.log('err: ' + JSON.stringify(err)));
  }

  setExcelUsuario() {
    if (this.globalProvider.plan.plan_restriccion == false) {
      this.load = this.globalProvider.cargando(this.globalProvider.data.msj.load);
      if (this.platform.is('android')) {
        this.fileChooser.open().then(url => {
          this.filePath.resolveNativePath(url).then(path => {
            this.file.resolveLocalFilesystemUrl(path).then(newUrl => {
              let options: FileUploadOptions = {
                fileKey: 'file',
                fileName: newUrl.name,
                headers: {}
              }
              this.setFileTrasfder(newUrl.nativeURL, options);
            });
          });
        });
      }
      if (this.platform.is('ios')) {
        this.iosFilePicker.pickFile().then(url => {
          var array = url.split('/');
          var nombre = array[array.length - 1];
          let options: FileUploadOptions = {
            fileKey: 'file',
            fileName: nombre,
            headers: {}
          }
          this.setFileTrasfder(url, options);
        }).catch(err => console.log('err: ' + JSON.stringify(err)));
      }
    } else {
      let alert = this.alertController.create({
        title: '',
        subTitle: this.globalProvider.plan.plan_restriccion_msn,
        buttons: ['Ok']
      });
      alert.present();
    }
  }

  setFileTrasfder(path: string, options: any) {
    let url = "servicio=setExcelUsuario&id_usuario=" + this.globalProvider.usuario.id_usuario;
    const fileTransfer: FileTransferObject = this.transfer.create();
    fileTransfer.upload(path, this.httpProvider.url + url, options).then((data) => {
      this.load.dismiss();
      this.res = JSON.parse(data.response);
      if (this.res.encabezado) {
        this.datos = this.res.encabezado;
        this.id_pre_campania = this.res.id_pre_campania;
        this.nombre_archivo = this.res.nombre;
        this.mostrar = true;
      } else {
        this.globalProvider.alerta(this.res.msn);
      }
    }, (err) => {
      this.load.dismiss();
      console.log('err: ' + JSON.stringify(err));
    }).catch(err => console.log('err: ' + JSON.stringify(err)));
  }

  cancelar(data: boolean = false) {
    this.viewController.dismiss(data);
  }

  chekedSms(event) {
    if (event.value == true) {
      this.msnS = event.value;
      this.sms = 'Y';
      this.sms_tex = null;
    } else {
      this.msnS = event.value;
      this.sms = 'N';
      this.sms_tex = ''
    }
  }

  guardarRegistro() {
    this.submitted = true;
    if (this.ordenarCampania.valid) {
      this.load = this.globalProvider.cargando(this.globalProvider.data.msj.load);
      let url = 'servicio=setCampania';
      let posicion: number = parseInt(this.ordenarCampania.value.telefono);
      let posicion1: number = parseInt(this.ordenarCampania.value.nombre);
      let c1: number = parseInt(this.ordenarCampania.value.c1);
      let c2: number = parseInt(this.ordenarCampania.value.c2);
      let c3: number = parseInt(this.ordenarCampania.value.c3);
      let c4: number = parseInt(this.ordenarCampania.value.c4);
      let data = {
        id_usuario: this.globalProvider.usuario.id_usuario,
        id_pre_campania: this.id_pre_campania,
        nombre_exel: this.ordenarCampania.value.nombreArchivo,
        nombre_campania: this.ordenarCampania.value.nombreCampania,
        telefono: this.datos[posicion],
        nombre: this.datos[posicion1],
        contenido1: { nombre_input: this.ordenarCampania.value.c1Nombre, key1: this.datos[c1] },
        contenido2: { nombre_input: this.ordenarCampania.value.c2Nombre, key2: this.datos[c2] },
        contenido3: { nombre_input: this.ordenarCampania.value.c3Nombre, key3: this.datos[c3] },
        contenido4: { nombre_input: this.ordenarCampania.value.c4Nombre, key4: this.datos[c4] },
        sms: this.sms,
        sms_pre: this.ordenarCampania.value.sms_predeterminado
      }
      this.httpProvider.post(data, url).then(res => {
        this.load.dismiss();
        this.res = res;
        if (this.res.error == 'false') {
          if (this.res.errorArchivo == 'false') {
            this.globalProvider.alerta(this.res.msn);
            this.datos = [];
            this.mostrar = false;
            this.cancelar(true);
          } else {
            this.globalProvider.alerta(this.res.msn);
          }
        } else {
          this.globalProvider.alerta(this.res.msn);
        }
      }).catch(err => console.log('err: ' + JSON.stringify(err)));
    }
  }

  getNombre(c: number, f: boolean = null) {
    var n: number;
    if (c == 1) {
      n = parseInt(this.ordenarCampania.value.c1);
      this.columna[0].c = this.datos[n].nombre;
      this.columna[0].r = false;
    } else if (c == 2) {
      n = parseInt(this.ordenarCampania.value.c2);
      this.columna[1].c = this.datos[n].nombre;
      this.columna[1].r = false;
    } else if (c == 3) {
      n = parseInt(this.ordenarCampania.value.c3);
      this.columna[2].c = this.datos[n].nombre;
      this.columna[2].r = false;
    } else {
      n = parseInt(this.ordenarCampania.value.c4);
      this.columna[3].c = this.datos[n].nombre;
      this.columna[3].r = false;
    }
  }

  newCampania() {
    for (let i = 1; i < 13; i++) {
      this.numeros.push(i);
    }
    this.campania_blanco = !this.campania_blanco;
    let url = "servicio=setNewCampania&id_usuario=" + this.globalProvider.usuario.id_usuario;
    /*this.httpProvider.get(url).then(res => {
      this.res = res;
      console.log(JSON.stringify(res));
    });*/
    this.getCatalogoEstadoFilaCampania();
  }

  llamar(individual: boolean = false) {
    this.callNumber.callNumber(this.numerico.transform(this.new_campania.telefono), true).then(res => {
      if (individual == false) {
        this.panel = !this.panel;
      }
    }).catch(err => console.log('err; ' + JSON.stringify(err)));
  }

  armarNumero(i: number) {
    let n: string = (this.numeros[i] != 11) ? this.numeros[i].toString() : '0';
    this.new_campania.telefono += n;
  }

  getCatalogoEstadoFilaCampania() {
    let url = 'servicio=getCatalogoEstadoFilaCampania';
    this.httpProvider.get(url).then(res => {
      this.catalogoEstado = res;
    }).catch(err => console.log('err: ' + JSON.stringify(err)));
  }

  clickStado(key) {
    if (key == 1 || key == 2) {
      this.setFilaActivaCampania();
    }
    if (key == 3) {
      this.setSms();
      this.setFilaActivaCampania();
    }
    if (key == 4) {
      this.setSms();
      this.serEventoCalendar();
      this.setFilaActivaCampania();
    }
  }

  setSms() {
    this.Sms.send(this.numerico.transform(this.new_campania.telefono), this.new_campania.sms_tex).then(res => console.log('res: ' + res)).catch(err => console.log('err: ' + err));
  }

  serEventoCalendar() {
    this.calendar.hasReadWritePermission().then(res => {
      console.log('res: ' + JSON.stringify(res));
    }).catch(err => alert('err: ' + JSON.stringify(err)));
    var startDate = new Date(this.new_campania.fecha);
    this.calendar.createEvent(
      this.new_campania.nombre_campania,
      'PowerDialer',
      'name: ' + this.new_campania.nombre + ' , phone: ' + this.numerico.transform(this.new_campania.telefono) + ' , note: ' + this.new_campania.nota,
      startDate,
      this.fechaPosterios.transform(startDate, 1)
    ).then(res => {
      this.setFilaActivaCampania();
    }).catch(err => console.log('err: ' + JSON.stringify(err)));
  }

  cheked(event) {
    this.new_campania.sms = !this.new_campania.sms;
  }

  setFilaActivaCampania(){

  }
}