import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';

import { HttpProvider } from '../../providers/http/http';
import { GlobalProvider } from '../../providers/global/global';

import { Camera, CameraOptions } from '@ionic-native/camera';
import { MediaCapture, MediaFile, CaptureVideoOptions } from '@ionic-native/media-capture';
import { Clipboard } from '@ionic-native/clipboard';
import { SocialSharing } from '@ionic-native/social-sharing';

@IonicPage()
@Component({
  selector: 'page-social',
  templateUrl: 'social.html',
})
export class SocialPage {
  img: string;
  video: string;
  whizar: Array<{ color: string, activo: boolean }>;
  imagenes: Array<any>;
  videos: Array<any>;
  load: any;
  option: string;
  img_tem: string;
  video_tem: string;
  post_guardados: boolean;
  img_tex: string;
  spinner1: boolean;
  poster: string;
  poster_tem: string;
  alto: string;
  ancho: string;
  posicion_logo: Array<{ title: string, posicion: number, id: number }>;
  hashtag_tex: string;
  busqueda: string;
  idioma: string;
  hashtag_selected: Array<boolean>;
  hashtags: Array<any>;
  comentario_tex: string;
  logos: Array<any>;
  logo_select: { id: number, posicion: number };
  list_save: Array<any>;
  textarea_comentarios: Array<string>;

  pagina_img: number;
  pagina_video: number;
  idiomas: Array<any>;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private viewController: ViewController,
    private camera: Camera,
    private mediaCapture: MediaCapture,
    private httpProvider: HttpProvider,
    private globalProvider: GlobalProvider,
    private alertController: AlertController,
    private clipboard: Clipboard,
    private socialSharing: SocialSharing
  ) {
    this.whizar = [
      { color: '#745af2', activo: true },
      { color: null, activo: false },
      { color: null, activo: false },
      { color: null, activo: false }
    ];
    this.option = 'I';
    this.imagenes = [];
    this.videos = [];
    this.posicion_logo = [
      { title: '_leftTop', posicion: null, id: null },
      { title: '_topCenter', posicion: null, id: null },
      { title: '_rightTop', posicion: null, id: null },
      { title: '_leftCenter', posicion: null, id: null },
      { title: '_center', posicion: null, id: null },
      { title: '_rightCenter', posicion: null, id: null },
      { title: '_leftBottom', posicion: null, id: null },
      { title: '_bottomCenter', posicion: null, id: null },
      { title: '_rightBottom', posicion: null, id: null }
    ];
    this.idioma = 'en';
    this.hashtag_selected = [];
    this.hashtags = [];
    this.logos = [];
    this.logo_select = { id: null, posicion: null };
    this.list_save = [];
    this.textarea_comentarios = [];

    this.pagina_img = 1;
    this.pagina_video = 1;
    this.idiomas = [];
  }

  ionViewDidLoad() {
    this.getAdvanSocialLogoUsuario();
    this.getCatlogoLenguajeAdvanSocial();
  }

  closeModal(): void {
    this.viewController.dismiss();
  }

  getAdvanSocialLogoUsuario() {
    let url: string = "servicio=getAdvanSocialLogoUsuario&id_usuario=" + this.globalProvider.usuario.id_usuario +
      "&lg=" + this.globalProvider.idioma.key;
    this.httpProvider.get(url).then((res: any) => {
      this.logos = res.logo;
    }).catch(err => console.log('err: ', err.toString()))
  }

  reset(): void {
    this.img = undefined;
    this.video = undefined;
    this.whizar = [
      { color: '#745af2', activo: true },
      { color: null, activo: false },
      { color: null, activo: false },
      { color: null, activo: false }
    ];
    this.imagenes = [];
    this.videos = [];
    this.option = 'I';
    this.post_guardados = undefined;
    this.img_tex = '';
    this.spinner1 = undefined;
    this.poster = undefined;
    this.ancho = undefined;
    this.alto = undefined;
    this.idioma = 'en';
    this.hashtag_tex = undefined;
    this.busqueda = undefined;
    this.hashtag_selected = [];
    this.hashtags = [];
    this.comentario_tex = undefined;
    this.hashtag_tex = undefined;
    this.list_save = [];
    this.textarea_comentarios = [];
    this.logo_select = { id: null, posicion: null };

    this.pagina_img = 1;
    this.pagina_video = 1;
    this.idiomas = [];
    this.getCatlogoLenguajeAdvanSocial();
  }

  menu(i: number) {
    this.whizar.forEach((element, index) => {
      if (index <= i) {
        element.color = "#745af2";
        if (i == index) {
          element.activo = true;
        } else {
          element.activo = false;
        }
      } else {
        element.color = null;
        element.activo = false;
      }
    });
  }

  tomarForto() {
    const options: CameraOptions = {
      quality: 50,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      targetWidth: 600,
      targetHeight: 600,
      correctOrientation: true,
      saveToPhotoAlbum: true
    };
    this.camera.getPicture(options).then(imageData => {
      this.video_tem = undefined;
      this.img_tem = "data:image/jpeg;base64," + imageData;
      if (this.logos.length > 0) {
        this.menu(1);
        this.logos.forEach((elemento) => {
          if (elemento.predeterminado == "Y") {
            this.inserPosicionLogo(elemento.posicion, elemento.id_advansocial_logo)
          }
        }, this);
      } else {
        let url: string = "servicio=getUrlImgLogoUsuario&id_usuario=" + this.globalProvider.usuario.id_usuario;
        let data: Object = {
          imagen: this.img_tem,
          id_logo: 0,
          posicion: 7,
          lg: this.globalProvider.idioma.key
        }
        this.httpProvider.post(data, url).then((res: any) => {
          this.img = res.url;
        }).catch(err => console.log('err', err.toString()));
        this.menu(2);
        this.logo_select.id = 0;
        this.logo_select.posicion = 7;
      }
    }, err => console.log('err: ', err.toString()));
  }

  galeriaImagenes() {
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
      this.video_tem = undefined;
      this.img_tem = "data:image/jpeg;base64," + imageData;
      if (this.logos.length > 0) {
        this.menu(1);
        this.logos.forEach((elemento) => {
          if (elemento.predeterminado == "Y") {
            this.inserPosicionLogo(elemento.posicion, elemento.id_advansocial_logo)
          }
        }, this);
      } else {
        let url: string = "servicio=getUrlImgLogoUsuario&id_usuario=" + this.globalProvider.usuario.id_usuario;
        let data: Object = {
          imagen: this.img_tem,
          id_logo: 0,
          posicion: 7,
          lg: this.globalProvider.idioma.key
        }
        this.httpProvider.post(data, url).then((res: any) => {
          this.img = res.url;
        }).catch(err => console.log('err', err.toString()));
        this.menu(2);
        this.logo_select.id = 0;
        this.logo_select.posicion = 7;
      }
    }, (err) => console.log('err: ', err.toString()));
  }

  tomarVideo() {
    this.img = undefined;
    let options: CaptureVideoOptions = {
      limit: 1,
      duration: 60
    }
    this.mediaCapture.captureVideo(options).then((res: MediaFile[]) => {
      this.img = undefined;
      this.video = res[0].fullPath;
      this.menu(2);
      this.logo_select.id = 0;
      this.logo_select.posicion = 7;
    }, (err) => {
      console.log(JSON.stringify(err));
    });
  }

  catalogoImgOVideo() {
    if (this.option == 'I') {
      let url: string = "servicio=getFotosAdvanSocial&texto=" + this.img_tex.replace(/\s/g, "+") +
        "&page=" + this.pagina_img +
        "&lg=" + this.globalProvider.idioma.key;
      this.httpProvider.get(url).then((res: Array<any>) => {
        this.imagenes = res;
      }).catch(err => console.log('err: ', err.toString()))
    } else {
      let url: string = "servicio=getVideoAdvanSocial&texto=" + this.img_tex.replace(/\s/g, "+") +
        "&page=" + this.pagina_video +
        "&lg=" + this.globalProvider.idioma.key;
      this.httpProvider.get(url).then((res: Array<any>) => {
        this.videos = res;
      }).catch(err => console.log('err: ', err.toString()));
    }
  }

  cargarMas() {
    this.spinner1 = true;
    if (this.option == 'I') {
      this.pagina_img++;
      let url: string = "servicio=getFotosAdvanSocial&texto=" + this.img_tex.replace(/\s/g, "+") +
        "&page=" + this.pagina_img +
        "&lg=" + this.globalProvider.idioma.key;
      this.httpProvider.get(url).then((res: Array<any>) => {
        this.imagenes = this.imagenes.concat(res);
      }).catch(err => console.log('err: ', err.toString()));
    } else {
      this.pagina_video++;
      let url: string = "servicio=getVideoAdvanSocial&texto=" + this.img_tex.replace(/\s/g, "+") +
        "&page=" + this.pagina_video +
        "&lg=" + this.globalProvider.idioma.key;
      this.httpProvider.get(url).then((res: Array<any>) => {
        this.videos = this.videos.concat(res);
      }).catch(err => console.log('err: ', err.toString()));
    }
    this.spinner1 = false;
  }

  selectImg(ruta: string, poster: string = null, ancho: string = null, alto: string = null, id: string = null) {
    if (this.option == 'I') {
      this.video = undefined;
      this.video_tem = undefined;
      this.img = undefined;
      this.img_tem = ruta;
    } else {
      this.poster_tem = id;
      this.alto = alto;
      this.ancho = ancho;
      this.video = undefined;
      this.video_tem = ruta;
      this.img = undefined;
      this.img_tem = undefined;
    }
    if (this.logos.length > 0) {
      this.logos.forEach((elemento) => {
        if (elemento.predeterminado == "Y") {
          this.inserPosicionLogo(elemento.posicion, elemento.id_advansocial_logo)
        }
      }, this);
      this.menu(1);
    } else {
      this.menu(2);
      if (this.option == "I") {
        var t = this.httpProvider.URL_IMG + this.img_tem;
        this.img = t.replace(/&/g, "<->");
        this.img += "&id_usuario=" + this.globalProvider.usuario.id_usuario +
          "&lo=" + 0 + "&pos=" + 7 +
          "&us=" + this.globalProvider.usuario.id_usuario +
          "&lg=" + this.globalProvider.idioma.key;
      }
      if (this.option == "V") {
        let url: string = this.httpProvider.URL_VIDEO + id +
          "&src=" + ruta +
          "&id=" + id +
          "&w=" + ancho +
          "&h=" + alto +
          "&lo=" + 0 +
          "&pos=" + 7 +
          "&us=" + this.globalProvider.usuario.id_usuario +
          "&lg=" + this.globalProvider.idioma.key;
        this.img = undefined;
        this.video = undefined;
        this.httpProvider.getTem(url).then((res: any) => {
          this.video = res.url;
          this.poster = poster;
        }).catch(err => console.log('err: ', err.toString()));
      }
      this.logo_select.id = 0;
      this.logo_select.posicion = 7;
    }
  }

  back() {
    var posicion: number;
    this.whizar.forEach((element, index) => {
      if (element.activo) {
        posicion = index;
      }
    });
    if (posicion == 2 && (this.logos.length == 0 || this.option == "VG")) {
      this.reset();
    } else {
      this.menu(posicion - 1);
    }
  }

  nex() {
    var posicion: number;
    if (this.whizar[1].activo) {
      if (this.option == "I") {
        var t = this.httpProvider.URL_IMG + this.img_tem;
        this.img = t.replace(/&/g, "<->");
        this.img += "&id_usuario=" + this.globalProvider.usuario.id_usuario +
          "&lo=" + this.logo_select.id +
          "&pos=" + this.logo_select.posicion +
          "&us=" + this.globalProvider.usuario.id_usuario +
          "&lg=" + this.globalProvider.idioma.key;
      }

      if (this.option == "V") {
        let url: string = this.httpProvider.URL_VIDEO + this.poster_tem +
          "&src=" + this.video_tem +
          "&w=" + this.ancho +
          "&h=" + this.alto +
          "&lo=" + this.logo_select.id +
          "&pos=" + this.logo_select.posicion +
          "&us=" + this.globalProvider.usuario.id_usuario +
          "&lg=" + this.globalProvider.idioma.key;
        this.img = undefined;
        this.video = undefined;
        this.httpProvider.getTem(url).then((res: any) => {
          this.video = res.url;
          this.img = undefined;
          this.poster = this.poster;
        }).catch(err => console.log('err: ', err.toString()));
      }

      if (this.option == "IG" || this.option == "GI") {
        let url: string = "servicio=getUrlImgLogoUsuario&id_usuario=" + this.globalProvider.usuario.id_usuario;

        let data: Object = {
          imagen: this.img_tem,
          id_logo: this.logo_select.id,
          posicion: this.logo_select.posicion,
          lg: this.globalProvider.idioma.key
        }
        this.httpProvider.post(data, url).then((res: any) => {
          this.img = res.url;
        }).catch(err => console.log('err', err.toString()));
      }
    }
    this.whizar.forEach((element, index) => {
      if (element.activo) {
        posicion = index;
      }
    });
    this.menu(posicion + 1);
  }

  getCatlogoLenguajeAdvanSocial() {
    let url: string = "servicio=getCatlogoLenguajeAdvanSocial&lg=" + this.globalProvider.idioma.key;
    this.httpProvider.get(url).then((res: Array<any>) => {
      this.idiomas = res;
    }).catch(err => console.log('err: ', err.toString()));
  }

  getHashtagAdvanSocial() {
    this.hashtag_selected = [];
    let url: string = "servicio=getHashtagAdvanSocial&texto=" + this.busqueda.replace(/\s/g, "+") +
      "&lenguaje=" + this.idioma +
      "&lg=" + this.globalProvider.idioma.key;
    this.httpProvider.get(url).then((res: Array<any>) => {
      res.forEach(() => {
        this.hashtag_selected.push(true);
      }, this);
      this.hashtags = res;
    }).catch(err => console.log('err: ', err.toString()));
  }

  clickHashtag(text: string) {
    if (this.contadorHashtag() < 29) {
      if (this.hashtag_tex) {
        this.hashtag_tex += text + ' ';
      } else {
        this.hashtag_tex = text + ' ';
      }
    }
  }

  contadorHashtag() {
    if (this.hashtag_tex) {
      var arr = this.hashtag_tex.split("#");
      return arr.length - 1;
    }
    return 0;
  }

  replaceEspacio(text: string) {
    var t = text.replace(/\s/g, "")
    return t;
  }

  inserPosicionLogo(posicion: number, id: number) {
    this.posicion_logo.forEach((element, index) => {
      if (posicion == index) {
        element.posicion = posicion;
        element.id = id;
        this.logo_select = { id: id, posicion: posicion };
      } else {
        element.posicion = null;
        element.id = null;
      }
    }, this);
  }

  compartir() {
    this.load = this.globalProvider.cargando(this.globalProvider.data.msj.load);
    var file: string;
    var a: string = (this.globalProvider.plan.advansocial != 'P') ? `
    .
    .
    .
    The Entrepreneurs Technology: https://advansales.com
    .
    .
    .` :
      `
    .
    .
    .
    `;
    if (this.hashtag_tex) {
      var tem = this.hashtag_tex.split('#');
      var mitad: number = Math.round(tem.length / 2);
      tem.forEach((element, index) => {
        if (index == 0) {
          this.comentario_tex += a + element + ' ';
        } else {
          this.comentario_tex += "#" + element;
        }
        if (index == mitad && this.globalProvider.plan.advansocial != 'P') {
          this.comentario_tex += "#advansales ";
        }
      }, this);
    } else if (this.globalProvider.plan.advansocial != 'P') {
      this.comentario_tex + a + "#advansales";
    }

    this.clipboard.copy(this.comentario_tex);
    this.clipboard.paste().then(
      (resolve: string) => {
        console.log(resolve);
      },
      (reject: string) => {
        console.log('Error: ' + reject);
      }
    );

    this.clipboard.clear();
    if (this.option == "I" || this.option == "IG" || this.option == "GI") {
      file = this.img;
    } else {
      file = this.video;
    }
    var tex = this.comentario_tex;
    this.comentario_tex = '';
    this.socialSharing.share(tex, null, file, null).then(() => {
      this.load.dismiss();
    }).catch(err => {
      this.load.dismiss();
      console.log('err: ' + JSON.stringify(err));
    });
  }

  getAdvanSocial() {
    this.load = this.globalProvider.cargando(this.globalProvider.data.msj.load)
    this.post_guardados = true;
    let url: string = "servicio=getAdvanSocial&id_usuario= " + this.globalProvider.usuario.id_usuario +
      "&lg=" + this.globalProvider.idioma.key;
    this.httpProvider.get(url).then((res: any) => {
      this.load.dismiss();
      if (res.error == 'false') {
        res.advansocial.forEach(element => {
          this.textarea_comentarios.push(element.comentario + ' ' + element.hashtag);
        }, this);
        this.list_save = res.advansocial;
      }
    }).catch(err => console.log('err: ', err.toString()));
  }

  setEliminarAdvanSocial(id_advansocial: string) {
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
            let url: string = "servicio=setEliminarAdvanSocial&id_advansocial=" + id_advansocial +
              "&lg=" + this.globalProvider.idioma.key;
            this.httpProvider.get(url).then((res: any) => {
              if (res.error == 'false') {
                this.getAdvanSocial();
              } else {
                this.globalProvider.alerta(res.msn);
              }
            }).catch(err => console.log('err: ', err.toString()));
          }
        }
      ]
    });
    confirm.present();
  }

  setAdvanSocial() {
    this.load = this.globalProvider.cargando(this.globalProvider.data.msj.load);
    var ruta: string;
    var tipo: string;
    if (this.img) {
      ruta = this.img;
      tipo = 'I';
    } else {
      ruta = this.video;
      tipo = 'V';
    }

    let url: string = "servicio=setAdvanSocial";
    let data: Object = {
      id_usuario: this.globalProvider.usuario.id_usuario,
      comentario: this.comentario_tex,
      hashtag: this.hashtag_tex,
      tipo: tipo,
      url: ruta,
      poster: this.poster,
      id_logo: this.logo_select.id,
      posicion: this.logo_select.posicion,
      lg: this.globalProvider.idioma.key
    };

    this.httpProvider.post(data, url).then((res: any) => {
      this.load.dismiss();
      if (res.error == 'false') {
        this.reset();
      } else {
        this.globalProvider.alerta(res.msn)
      }
    }).catch(err => console.log('err: ', err.toString()));
  }

  setEditAdvanSocial(social: any, i: number) {
    var tem = this.textarea_comentarios[i].split('#')
    var comentarios = tem[0];
    var hashtag: string = '';
    tem.forEach((element, index) => {
      if (index > 0) {
        hashtag += "#" + element;
      }
    });

    let url: string = "servicio=setEditAdvanSocial";
    let data: Object = {
      id_advansocial: social.id_advansocial,
      comentario: comentarios,
      hashtag: hashtag,
      tipo: social.tipo,
      url: social.url,
      id_logo: social.id_advansocial_logo,
      posicion: social.posicion,
      lg: this.globalProvider.idioma.key
    }

    this.httpProvider.post(data, url).then((res: any) => {
      if (res.error == 'false') {
        this.getAdvanSocial();
      } else {
        this.globalProvider.alerta(res.msn);
      }
    }).catch(err => console.log('err: ', err.toString()));
  }

  compartirSave(social: any) {
    this.load = this.globalProvider.cargando(this.globalProvider.data.msj.load);
    var a: string = (this.globalProvider.plan.advansocial != 'P') ? `
    .
    .
    .
    The Entrepreneurs Technology: https://advansales.com
    .
    .
    .` :
      `
    .
    .
    .    
    `;

    var tem = social.hashtag.split('#');
    var mitad: number = Math.round(tem.length / 2);
    tem.forEach((element, index) => {
      if (index == 0) {
        social.comentario += a + element;
      } else {
        social.comentario += "#" + element;
      }
      if (index == mitad && this.globalProvider.plan.advansocial != 'P') {
        social.comentario += "#advansales " + "#" + element;
      }
    });

    this.clipboard.copy(social.comentario);
    this.clipboard.paste().then(
      (resolve: string) => {
        console.log(resolve);
      },
      (reject: string) => {
        console.log('Error: ' + reject);
      }
    );

    this.socialSharing.share(social.comentario, null, social.url, null).then(() => {
      this.reset();
      this.load.dismiss();
      this.setEditAdvanSocialShare(social.id_advansocial);
    }).catch(err => {
      this.load.dismiss();
      console.log('err: ', err.toString());
    });
  }

  setEditAdvanSocialShare(id: string) {
    let url: string = "servicio=setEditAdvanSocialShare&id_advansocial=" + id +
      "&lg=" + this.globalProvider.idioma.key;
    this.httpProvider.get(url).then(() => {
      console.log('success');
    }).catch(err => console.log('err:', err.toString()));
  }

  returnBorder(color: string) {
    return "solid 5px " + color;
  }
}