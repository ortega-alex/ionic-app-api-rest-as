import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, Platform } from 'ionic-angular';
import { HttpProvider } from '../../providers/http/http';
import { GlobalProvider } from '../../providers/global/global';
import { Vcard } from '../../model/Vcard';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Camera, CameraOptions } from '@ionic-native/camera';

@IonicPage()
@Component({
  selector: 'page-vcard',
  templateUrl: 'vcard.html',
})
export class VcardPage {

  dispositivo: boolean;
  vcard: Vcard;
  edit: boolean;
  password: string;
  tamanio: string;
  load: any;
  galerita: { img: boolean, logo: boolean };

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private viewController: ViewController,
    private platform: Platform,
    private httpProvider: HttpProvider,
    private globalProvider: GlobalProvider,
    private socialSharing: SocialSharing,
    private camera: Camera
  ) {
    this.dispositivo = (this.platform.is("android")) ? true : false;
    this.edit = true;
    this.vcard = new Vcard();
    this.password = null;
    this.galerita = { img: false, logo: false };
  }

  ionViewDidLoad() {
    this.getVcardUsuario();
  }

  closeModal() {
    if (this.edit == false) {
      this.edit = true;
    } else {
      this.viewController.dismiss();
    }
  }

  getVcardUsuario() {
    let url: string = "servicio=getVcardUsuario&id_usuario=" + this.globalProvider.usuario.id_usuario;
    this.httpProvider.get(url).then((res: any) => {
      if (res.error == "false") {
        this.vcard = res;
        if (this.vcard.telefonos.length == 0) {
          this.vcard.telefonos.push({ id_vcard_telefono: ' ', telefono: null, tipo: '0' })
        }
        if (res.tamanio != null) {
          this.tamanio = res.tamanio.replace('px', '');
        }
      } else {
        this.vcard.telefonos.push({ id_vcard_telefono: ' ', telefono: null, tipo: '0' })
      }
    })
  }

  galeriaImagenes(tipo: string) {
    const options: CameraOptions = {
      quality: 50,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      targetWidth: 600,
      targetHeight: 600,
      correctOrientation: true
    }
    this.camera.getPicture(options).then((imageData) => {
      if (tipo == 'logo') {
        //this.vcard.ruta_logo = imageData;
        this.galerita.logo = true;
        this.vcard.ruta_logo = "data:image/jpeg;base64," + imageData;
      } else {
        //this.vcard.ruta_img = imageData;
        this.galerita.img = true;
        this.vcard.ruta_img = "data:image/jpeg;base64," + imageData;
      }
    }, (err) => {
      console.log(JSON.stringify(err));
    });
  }

  guardarPassword() {
    if (this.password != null) {
      this.password = null;
      //console.log('guradar: ' + this.password);
    } else {
      this.password = '';
      //console.log('cancelar: ' + this.password);
    }
  }

  setTamanio() {
    this.vcard.tamanio = this.tamanio + 'px';
    console.log(this.vcard.tamanio);
  }

  setOrUpdateVcardUsuario() {
    this.load = this.globalProvider.cargando(this.globalProvider.data.msj.load);
    if (this.galerita.img == false) {
      //this.vcard.ruta_img = "data:image/jpeg;base64," + this.vcard.ruta_img;
      //} else {
      this.vcard.ruta_img = null;
    }
    if (this.galerita.logo == false) {
      //this.vcard.ruta_logo = "data:image/jpeg;base64," + this.vcard.ruta_logo;
      //} else {
      this.vcard.ruta_logo = null;
    }
    if (this.password != null && this.password.trim() != '') {
      this.vcard.clave = this.password;
    }
    this.vcard.telefonos.forEach((element, index) => {
      if (element.id_vcard_telefono.trim() == '' || element.telefono == null || element.telefono.trim() == '') {
        this.vcard.telefonos.splice(index, 1);
      }
    }, this)
    let url: string = "servicio=setOrUpdateVcardUsuario";
    this.httpProvider.post(this.vcard, url).then((res: any) => {
      this.load.dismiss();
      if (res.error == "true") {
        this.globalProvider.alerta(res.msn);
      }
      this.getVcardUsuario();
    }).catch(err => {
      this.load.dismiss();
      console.log('err: ' + JSON.stringify(err));
    });
    this.galerita = { img: false, logo: false };
  }

  eliminarTelefono(id: number) {
    console.log('id: ' + id);
  }

  compartir(url: string) {
    if (url != null) {
      this.socialSharing.share(url).then(() => {
        console.log('success: ')
      }).catch(err => alert('err: ' + JSON.stringify(err)));
    }
  }

  getImg(url: string, tipo: string) {
    if (this.galerita.logo == true && tipo == 'L') {
      return url;
    }
    if (this.galerita.img == true && tipo == 'I') {
      return url;
    }
    var name = (tipo == 'L') ? 'l.png' : 'a.jpg';
    if (url != null && url != '') {
      return this.httpProvider.URL_IMG + url;
    }
    return this.httpProvider.URL.replace('servicio.php?', '') + 'images/my_profile/' + name;
  }
}
