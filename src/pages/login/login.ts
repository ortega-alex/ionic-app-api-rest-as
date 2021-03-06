import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App, AlertController } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';

import { MyApp } from '../../app/app.component';
import { RegistroPage } from '../registro/registro';

import { isEmail, Minusculas } from '../../pipes/filtros/filtros';
import { GlobalProvider } from '../../providers/global/global';
import { HttpProvider } from '../../providers/http/http';
import { Usuario, Plan } from '../../model/Usuario';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  minusculas = new Minusculas();  
  is_mail = new isEmail();
  submitted: boolean;
  logIn: FormGroup;
  usuario: Usuario;
  plan: Plan;
  load: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private globalProvider: GlobalProvider,
    public formBuilder: FormBuilder,
    private httpProvider: HttpProvider,
    private alertController: AlertController,
    private app: App
  ) {
    this.submitted = false;
    this.usuario = new Usuario();
    this.plan = new Plan();
    this.logIn = this.formBuilder.group({
      correo: ['', Validators.required],
      clave: ['', Validators.required]
    });
  }

  ionViewDidLoad() {
    if (!this.globalProvider.idioma) {
      this.menu();
    }
  }

  menu() {
    this.app.getRootNav().setRoot(MyApp);
  }

  registro() {
    this.navCtrl.push(RegistroPage);
  }

  login() {
    this.submitted = true;
    if (this.logIn.valid) {
      this.load = this.globalProvider.cargando(this.globalProvider.data.msj.load);
      if (!this.is_mail.transform(this.logIn.value.correo)) {
        this.load.dismiss();
        let alert = this.alertController.create({
          subTitle: 'Enter a valid email!',
          buttons: ['OK']
        });
        alert.present();
        return false;
      }
      let url: string = "servicio=getLogInJ";
      let data: Object = {
        usuario: this.minusculas.transform(this.logIn.value.correo),
        clave: this.logIn.value.clave,
        tipo_registro: 'R',
        tipo_registro_id: null,
        lg: this.globalProvider.idioma.key
      }
      this.httpProvider.post(data, url).then((res: any) => {
        this.load.dismiss();
        if (res.error == 'false') {
          this.usuario.id_usuario = parseInt(res.id_usuario);
          this.usuario.correo = this.minusculas.transform(this.logIn.value.correo);
          this.usuario.nombre = res.nombre;
          this.usuario.apellido = res.apellido;
          this.usuario.logIn = res.logIn;
          this.usuario.tipo_registro = res.tipo_registro;
          this.usuario.tipo_usuario = res.tipo_usuario;
          this.usuario.imgUrl = null;
          this.usuario.log_out = null;
          this.globalProvider.usuario = this.usuario;

          this.plan.gratis = res.gratis;
          this.plan.mostrar_publicidad_video = res.mostrar_publicidad_video;
          this.plan.mostrar_publicidad_banner = res.mostrar_publicidad_banner;
          this.plan.compartir_fb = res.compartir_fb;
          this.plan.plan = res.plan;
          this.plan.plan_fecha_expiracion = res.plan_fecha_expiracion;
          this.plan.plan_restriccion = res.plan_restriccion;
          this.plan.bloqueo = res.bloque;
          this.plan.bloqueo_msn = res.bloqueo_msn;
          this.globalProvider.plan = this.plan;

          this.globalProvider.setUsuario(this.usuario);
          this.globalProvider.setPlan(this.plan);

          this.setLenguajeUsuario(this.usuario.id_usuario);

          this.menu();
        } else {
          this.globalProvider.alerta(res.msn);
        }
      }).catch((err) => {
        this.load.dismiss();
        console.log('err: ', err.toString());
      })
    }
  }

  setLenguajeUsuario(id: number) {
    let url: string = "servicio=setLenguajeUsuario&id_usuario=" + id +
      "&lg=" + this.globalProvider.idioma.key;
    this.httpProvider.get(url).catch((err) => console.log('err: ', err.toString()))
  }
}