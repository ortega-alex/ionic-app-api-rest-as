import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App, AlertController } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';

import { MyApp } from '../../app/app.component';
import { RegistroPage } from '../../pages/registro/registro';

import { Usuario } from '../../model/interfaces';
import { isEmail, Minusculas, getMilisegundos, Fecha, Hora } from '../../pipes/filtros/filtros';
import { GlobalProvider } from '../../providers/global/global';
import { HttpProvider } from '../../providers/http/http';
import { Storage } from '@ionic/storage';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  private usuario: Usuario = {
    id_usuario: null,
    nombre: null,
    apellido: null,
    correo: null,
    login: false,
    imgUrl: null,
    clave: null,
    tipo: null,
    gratis: null,
    mostrar_publicidad_video: null,
    mostrar_publicidad_banner: null,
    compartir_fb: null
  };
  private logIn: FormGroup;
  private submitted: boolean = false;
  private res: any;
  private load: any;
  private minusculas = new Minusculas();

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private globalProvider: GlobalProvider,
    private app: App,
    public formBuilder: FormBuilder,
    private httpProvider: HttpProvider,
    private alertController: AlertController,
    private facebook: Facebook,
    private storage : Storage
  ) {
    this.logIn = this.formBuilder.group({
      correo: ['', Validators.required],
      clave: ['', Validators.required]
    });
  }

  ionViewDidLoad() {}

  menu() {
    this.app.getRootNav().setRoot(MyApp);
  }

  validar() {
    this.submitted = true;
    if (this.logIn.valid) {
      let email = new isEmail();
      if (!email.transform(this.logIn.value.correo)) {
        let alert = this.alertController.create({
          subTitle: 'Enter a valid email!',
          buttons: ['OK']
        });
        alert.present();
      } else {
        this.login(this.logIn.value.correo, this.logIn.value.clave, 'R', null);
      }
    }
  }

  login(correo: string, clave: string, tipo: string, id: string, nombre: string = null, apellido: string = null) {
    if (id == null && tipo == 'R') {
      this.load = this.globalProvider.cargando(this.globalProvider.data.msj.load);
    }
    let url = 'servicio=getLogIn' +
      '&usuario=' + this.minusculas.transform(correo) +
      '&clave=' + clave +
      '&tipo_registro=' + tipo +
      '&tipo_registro_id=' + id;
    this.httpProvider.get(url).then(res => {
      if (id == null && tipo == 'R') {
        this.load.dismiss();
      }
      this.res = res;
      if (this.res.error == 'false') {
        this.usuario.id_usuario = this.res.id_usuario;
        this.usuario.correo = this.minusculas.transform(correo);
        this.usuario.nombre = this.res.nombre;
        this.usuario.apellido = this.res.apellido;
        this.usuario.login = (this.res.logIn == 'true') ? true : false;
        this.usuario.tipo = this.res.tipo_registro;
        this.usuario.imgUrl = null;
        this.usuario.gratis = this.res.gratis;
        this.usuario.mostrar_publicidad_video = this.res.mostrar_publicidad_video;
        this.usuario.mostrar_publicidad_banner = this.res.mostrar_publicidad_banner;
        this.usuario.compartir_fb = this.res.compartir_fb
        this.globalProvider.usuario = this.usuario;
        this.globalProvider.setUsuario();
        this.menu();
        this.storage.get('num').then(num => {
          if (num && num != null) {
            num ++;
            this.globalProvider.setNum(num);
          } else {
            this.globalProvider.setNum(1);
          }
        });
      } else {
        if (id != null && tipo == 'F') {
          let url = 'servicio=setRegistroUsuario' +
            '&usuario=' + this.minusculas.transform(correo) +
            '&clave=' + null +
            '&nombre=' + nombre +
            '&apellido=' + apellido +
            '&tipo_registro= ' + tipo +
            '&tipo_registro_id=' + id +
            '&token=' + this.globalProvider.token;
          this.httpProvider.get(url).then(res => {
            this.res = res;
            if (this.res.error == 'false') {
              this.login(correo, null, tipo, id);
            }
          });
        } else {
          this.globalProvider.alerta(this.res.msn);
        }
      }
    }).catch(err => console.log('err: ' + JSON.stringify(err)));
  }

  registro() {
    this.navCtrl.push(RegistroPage);
  }

  loginFB() {
    this.facebook.login(['email', 'public_profile']).then((response: FacebookLoginResponse) => {
      this.facebook.api('me?fields=id,name,last_name,email,first_name,picture.width(720).height(720).as(picture_large)', []).then(profile => {
        this.login(profile['email'], null, 'F', profile['id'], profile['first_name'], profile['last_name']);
      });
    });
  }
}