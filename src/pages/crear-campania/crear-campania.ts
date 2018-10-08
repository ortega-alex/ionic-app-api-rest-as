import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, PopoverController, Platform, AlertController } from 'ionic-angular';

import { GlobalProvider } from '../../providers/global/global';
import { HttpProvider } from '../../providers/http/http';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Campania, Stado, Util } from '../../model/interfaces';

import { FileChooser } from '@ionic-native/file-chooser';
import { FilePath } from '@ionic-native/file-path';
import { File } from '@ionic-native/file';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { IOSFilePicker } from '@ionic-native/file-picker';
import { CallNumber } from '@ionic-native/call-number';
import { FechaPosterios, Fecha, Hora } from '../../pipes/filtros/filtros';
import { SMS } from '@ionic-native/sms';
import { Calendar } from '@ionic-native/calendar';

@IonicPage()
@Component({
  selector: 'page-crear-campania',
  templateUrl: 'crear-campania.html',
})
export class CrearCampaniaPage {

  private ordenarCampania: FormGroup;
  private datos = [];
  private load: any;
  private id_pre_campania: any;
  private columna = [
    { c: null, r: true },
    { c: null, r: true },
    { c: null, r: true },
    { c: null, r: true },
  ];
  private sms: string = 'N';
  private campania_blanco: boolean = false;
  private numeros: Array<number> = [];
  private fechaPosterios = new FechaPosterios();
  private fecha = new Fecha();
  private hora = new Hora();
  private panel: boolean = false;
  private new_campania: Campania;
  private data: any;
  private campos: Stado;
  private util: Util = {
    submitted: false,
    error: null,
    noValido: null,
    mostrar: false,
    msnS: false,
    catalogoEstado: [],
    nombre_archivo: null,
    sms_tex: '',
    panel_llamada: null
  }

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
    private callNumber: CallNumber,
    private Sms: SMS,
    private calendar: Calendar,
    private alertController: AlertController
  ) {
    this.campos = { cambio: false, stado: [false, false] };
    var sms: boolean;
    var sms_tex: string;
    if (this.navParams.get('data')) {
      this.data = this.navParams.get('data');
      if (this.globalProvider.plan.leads != 'P') {
        sms = false;
        sms_tex = null;
      } else {
        sms = (this.data.sms == 'Y') ? true : false;
        sms_tex = (this.data.sms == 'Y') ? this.data.sms_predeterminado : null;
      }

      this.new_campania = { id_campania_manual: this.data.id_campania_manual, nombre_campania: this.data.nombre_campania, telefono: '', nombre: null, fecha: null, sms: sms, sms_tex: sms_tex, nota: null, stado: null, campos: { edit_uno: this.data.campo_1_text, uno: null, uno_stado: false, edit_dos: this.data.campo_2_text, dos: null, dos_stado: false } };
      this.dialer();
      this.getCatalogoEstadoFilaCampania();
      this.campania_blanco = !this.campania_blanco;
    } else {
      if (this.globalProvider.plan.leads == 'N') {
        sms = false;
        sms_tex = null;
      }
      this.new_campania = { id_campania_manual: null, nombre_campania: null, telefono: '', nombre: null, fecha: null, sms: sms, sms_tex: sms_tex, nota: null, stado: null, campos: { edit_uno: 'Field 1:', uno: null, uno_stado: false, edit_dos: 'Field 2:', dos: null, dos_stado: false } };
    }
    this.ordenarCampania = this.formBuilder.group({
      nombreArchivo: [''],
      nombreCampania: ['', Validators.required],
      telefono: ['', Validators.required],
      nombre: ['', Validators.required],
      nota: ['', Validators.required],
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

  setExcelUsuario() {
    if (this.globalProvider.plan.leads != 'N') {
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
            }).catch(err => console.log('err: ' + JSON.stringify(err)));
          }).catch(err => console.log('err filePat: ' + JSON.stringify(err)));
        }).catch(err => console.log('err choset: ' + JSON.stringify(err)));
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
        subTitle: this.globalProvider.plan.leads_sms_msn,
        buttons: ['Ok']
      });
      alert.present();
    }
  }

  setFileTrasfder(path: string, options: any) {
    this.load = this.globalProvider.cargando(this.globalProvider.data.msj.load);
    let url: string = "servicio=setExcelUsuario&id_usuario=" + this.globalProvider.usuario.id_usuario +
      "&lg=" + this.globalProvider.idioma.key;
    const fileTransfer: FileTransferObject = this.transfer.create();
    fileTransfer.upload(path, this.httpProvider.URL + url, options).then((data) => {
      this.load.dismiss();
      let res = JSON.parse(data.response);
      if (res.encabezado) {
        this.datos = res.encabezado;
        this.id_pre_campania = res.id_pre_campania;
        this.util.nombre_archivo = res.nombre;
        this.util.mostrar = true;
      } else {
        this.globalProvider.alerta(res.msn);
      }
    }, (err) => {
      console.log('err: ', err.toString());
      this.load.dismiss();
    }).catch(err => {
      this.load.dismiss();
      console.log('err: ', err.toString());
    });
  }

  cancelar(data: boolean = false) {
    this.viewController.dismiss(data);
  }

  chekedSms(event) {
    if (event.value == true) {
      this.util.msnS = event.value;
      this.sms = 'Y';
      this.util.sms_tex = null;
    } else {
      this.util.msnS = event.value;
      this.sms = 'N';
      this.util.sms_tex = ''
    }
  }

  guardarRegistro() {
    this.util.submitted = true;
    if (this.ordenarCampania.valid) {
      this.load = this.globalProvider.cargando(this.globalProvider.data.msj.load);
      let url: string = 'servicio=setCampania';
      let posicion: number = parseInt(this.ordenarCampania.value.telefono);
      let posicion1: number = parseInt(this.ordenarCampania.value.nombre);
      let posicion2: number = parseInt(this.ordenarCampania.value.nota);
      let c1: number = parseInt(this.ordenarCampania.value.c1);
      let c2: number = parseInt(this.ordenarCampania.value.c2);
      let c3: number = parseInt(this.ordenarCampania.value.c3);
      let c4: number = parseInt(this.ordenarCampania.value.c4);
      let data : Object = {
        id_usuario: this.globalProvider.usuario.id_usuario,
        id_pre_campania: this.id_pre_campania,
        nombre_exel: this.ordenarCampania.value.nombreArchivo,
        nombre_campania: this.ordenarCampania.value.nombreCampania,
        telefono: this.datos[posicion],
        nombre: this.datos[posicion1],
        nota: this.datos[posicion2],
        contenido1: { nombre_input: this.ordenarCampania.value.c1Nombre, key1: this.datos[c1] },
        contenido2: { nombre_input: this.ordenarCampania.value.c2Nombre, key2: this.datos[c2] },
        contenido3: { nombre_input: this.ordenarCampania.value.c3Nombre, key3: this.datos[c3] },
        contenido4: { nombre_input: this.ordenarCampania.value.c4Nombre, key4: this.datos[c4] },
        sms: this.sms,
        sms_pre: this.ordenarCampania.value.sms_predeterminado,
        lg: this.globalProvider.idioma.key
      }
      this.httpProvider.post(data, url).then((res: any) => {
        this.load.dismiss();
        if (res.error == 'false') {
          if (res.errorArchivo == 'false') {
            this.globalProvider.alerta(res.msn);
            this.datos = [];
            this.util.mostrar = false;
            this.cancelar(true);
          } else {
            this.globalProvider.alerta(res.msn);
          }
        } else {
          this.globalProvider.alerta(res.msn);
        }
      }).catch((err) => {
        this.load.dismiss();
        console.log('err: ', err.toString());
      });
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

  dialer() {
    for (let i = 1; i < 16; i++) {
      this.numeros.push(i);
    }
  }

  newCampania() {
    this.dialer();
    let sms: string = (this.new_campania.sms == true) ? 'Y' : 'N';
    this.getCatalogoEstadoFilaCampania();
    let url: string = "servicio=setCampaniaManual" +
      "&id_usuario=" + this.globalProvider.usuario.id_usuario +
      "&nombre=" + this.new_campania.nombre_campania +
      "&sms=" + sms +
      "&sms_tex=" + this.new_campania.sms_tex +
      "&lg=" + this.globalProvider.idioma.key;
    this.httpProvider.get(url).then((res: any) => {
      if (res.error == "false") {
        this.new_campania.id_campania_manual = res.id_campania_manual;
        this.campania_blanco = !this.campania_blanco;
      } else {
        this.globalProvider.alerta(res.msn);
      }
    }).catch(err => console.log('err: ', err.toString()));
  }

  llamar(individual: boolean = false) {
    if (this.new_campania.telefono != null && this.new_campania.telefono.trim() != '') {
      this.callNumber.callNumber(this.new_campania.telefono, true).then(res => {
        if (individual == false) {
          this.panel = !this.panel;
        }
      }).catch(err => console.log('err; ' + JSON.stringify(err)));
    }
  }

  armarNumero(i: number) {
    let n: string = (this.numeros[i] == 10) ? '*' : (this.numeros[i] == 11) ? '0' : (this.numeros[i] == 12) ? '#' : (this.numeros[i] == 14) ? '+' : this.numeros[i].toString();
    this.new_campania.telefono += n;
  }

  deleteNumber() {
    this.new_campania.telefono = this.new_campania.telefono.substring(0, this.new_campania.telefono.length - 1);
  }

  getCatalogoEstadoFilaCampania() {
    let url: string = 'servicio=getCatalogoEstadoFilaCampania&lg=' + this.globalProvider.idioma.key;
    this.httpProvider.get(url).then((res: any) => {
      this.util.catalogoEstado = res;
    }).catch(err => console.log('err: ', err.toString()));
  }

  clickStado(stado) {
    this.new_campania.stado = stado;
    if (stado == 1 || stado == 2) {
      this.setContenidoCampaniaManual();
    }
    if (stado == 3) {
      this.setSms();
      this.setContenidoCampaniaManual();
    }
    if (stado == 4) {
      this.setSms();
      if (this.new_campania.fecha != null) {
        this.serEventoCalendar();
      }
      this.setContenidoCampaniaManual();
    }
  }

  setSms() {
    this.Sms.send(this.new_campania.telefono, this.new_campania.sms_tex).then(res => console.log('res: ' + res)).catch(err => console.log('err: ' + err));
  }

  serEventoCalendar() {
    this.calendar.hasReadWritePermission().catch(err => console.log('err: ' + JSON.stringify(err)));
    var startDate = new Date(this.new_campania.fecha);
    this.calendar.createEvent(
      this.new_campania.nombre_campania,
      'PowerDialer',
      'name: ' + this.new_campania.nombre + ' , phone: ' + this.new_campania.telefono + ' , note: ' + this.new_campania.nota,
      startDate,
      this.fechaPosterios.transform(startDate, 1)
    ).then(() => {
      this.new_campania.fecha = null;
    }).catch(err => console.log('err: ' + JSON.stringify(err)));
  }

  cheked() {
    this.new_campania.sms = !this.new_campania.sms;
  }

  setContenidoCampaniaManual() {
    let cambio: string = (this.campos.cambio == true) ? 'Y' : 'N';
    this.load = this.globalProvider.cargando(this.globalProvider.data.msj.load);
    let info: { sms: string, fecha: Date, uno_stado: string, dos_stado: string, nombre: string, id: number } = {
      sms: (this.new_campania.sms == true) ? 'Y' : 'N',
      fecha: new Date(this.new_campania.fecha),
      uno_stado: (this.new_campania.campos.uno_stado == true) ? 'Y' : 'N',
      dos_stado: (this.new_campania.campos.dos_stado == true) ? 'Y' : 'N',
      nombre: this.new_campania.nombre_campania,
      id: this.new_campania.id_campania_manual
    }
    let url: string = "servicio=setContenidoCampaniaManual" +
      "&id_usuario=" + this.globalProvider.usuario.id_usuario +
      "&id_campania_manual=" + this.new_campania.id_campania_manual +
      "&estado=" + this.new_campania.stado +
      "&telefono=" + this.new_campania.telefono +
      "&nombre=" + this.new_campania.nombre +
      "&campo_1=" + this.new_campania.campos.uno +
      "&campo_2=" + this.new_campania.campos.dos +
      "&nota=" + this.new_campania.nota +
      "&otro_telefono=" + null +
      "&sms=" + info.sms +
      "&sms_text=" + this.new_campania.sms_tex +
      "&fecha_recordatorio=" + this.fecha.transform(info.fecha) +
      "&hora_recordatorio=" + this.hora.transform(info.fecha) +
      "&campo_text_1_edit=" + cambio +
      "&campo_text_1=" + this.new_campania.campos.edit_uno +
      "&campo_text_2_edit=" + cambio +
      "&campo_text_2=" + this.new_campania.campos.edit_dos +
      "&lg=" + this.globalProvider.idioma.key;
    this.httpProvider.get(url).then((res: any) => {
      this.load.dismiss();
      if (res.error == 'false') {
        this.new_campania = { id_campania_manual: info.id, nombre_campania: info.nombre, telefono: '', nombre: null, fecha: null, sms: false, sms_tex: null, nota: null, stado: null, campos: { edit_uno: 'Field 1:', uno: null, uno_stado: false, edit_dos: 'Field 2:', dos: null, dos_stado: false } };
        this.panel = !this.panel;
      } else {
        this.globalProvider.alerta(res.msn);
      }
    }).catch((err) => {
      this.load.dismiss();
      console.log('err: ', err.toString());
    });
  }

  habilitar(i: number) {
    this.campos.cambio = true;
    this.campos.stado[i] = !this.campos.stado[i];
  }

  setSMSPredeterminadoCampania(tipo: number, id: number) {
    let url: string = "servicio=setSMSPredeterminadoCampania" +
      "&id_campania=" + id +
      "&tipo=" + tipo +
      "&sms=" + this.new_campania.sms_tex +
      "&lg=" + this.globalProvider.idioma.key;
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

  chekedSmsCampania(event) {
    this.new_campania.sms = event.value;
    if (event.value == true) {
      this.new_campania.sms_tex = this.data.sms_predeterminado;
    } else {
      this.new_campania.sms_tex = null;
    }
  }

  saveAndExit() {
    this.panel = !this.panel;
    this.new_campania.telefono = '';
    this.new_campania.fecha = null;
  }
}