import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, PopoverController, Platform, Alert } from 'ionic-angular';

import { GlobalProvider } from '../../providers/global/global';
import { HttpProvider } from '../../providers/http/http';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';

import { FileChooser } from '@ionic-native/file-chooser';
import { FilePath } from '@ionic-native/file-path';
import { File } from '@ionic-native/file';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';

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
  ) {
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
    const fileTransfer: FileTransferObject = this.transfer.create();
    this.fileChooser.open().then(url => {
      this.filePath.resolveNativePath(url).then(path => {
        this.file.resolveLocalFilesystemUrl(path).then(newUrl => {
          this.load = this.globalProvider.cargando(this.globalProvider.data.msj.load);
          let url = "servicio=setExcelUsuario&id_usuario=" + this.globalProvider.usuario.id_usuario;
          let options: FileUploadOptions = {
            fileKey: 'file',
            fileName: newUrl.name,
            headers: {}
          }
          fileTransfer.upload(newUrl.nativeURL, this.httpProvider.url + url, options)
            .then((data) => {
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
            });
        });
      });
    });
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
}