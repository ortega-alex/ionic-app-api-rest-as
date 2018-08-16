import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ViewController, AlertController } from 'ionic-angular';
import { HttpProvider } from '../../providers/http/http';
import { GlobalProvider } from '../../providers/global/global';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Clipboard } from '@ionic-native/clipboard';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { MediaCapture, MediaFile, CaptureVideoOptions } from '@ionic-native/media-capture';

@IonicPage()
@Component({
  selector: 'page-share',
  templateUrl: 'share.html',
})
export class SharePage {

  dispositivo: boolean;
  hashtag_tex: string;
  comentario_tex: string;
  whizar: Array<string>;
  option: string;
  img_catalogo: boolean;
  img_tex: string;
  URLS: Array<{ URL: string, QUERY: string, CLIENTE_ID: string, PAGINA: number }> = [
    {
      URL: "https://api.unsplash.com/search/photos?page=",
      QUERY: "&query=",
      CLIENTE_ID: "&client_id=7e27b730888b9daa33c2b405cefb31c10cb887e8bf931e79cbd97d145019c6c4",
      PAGINA: 1
    }, {
      URL: "https://pixabay.com/api/videos/?pretty=true&page=",
      QUERY: "&q=",
      CLIENTE_ID: "&key=9806803-23a988fec28a26e532b3734e4",
      PAGINA: 1
    }
  ];
  imagenes: Array<any>;
  videos: Array<any>;
  res: any;
  spinner1: boolean;
  img: string;
  video: string;
  poster: string;
  busqueda: string;
  hashtag_selected: Array<boolean>;
  hashtags: Array<any>;
  idioma: string;
  hashtags_btn: boolean;
  load: any;

  post_guardados: boolean;
  list_save: Array<any>;
  textarea_comentarios: Array<string>;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private platform: Platform,
    private viewController: ViewController,
    private httpProvider: HttpProvider,
    private globalProvider: GlobalProvider,
    private socialSharing: SocialSharing,
    private clipboard: Clipboard,
    private camera: Camera,
    private mediaCapture: MediaCapture,
    private alertController: AlertController
  ) {
    this.dispositivo = (this.platform.is('android')) ? true : false;
    this.whizar = [
      '#745af2', null, null
    ];
    this.option = 'I';
    this.img_catalogo = true;
    this.imagenes = [];
    this.videos = [];
    this.hashtag_selected = [];
    this.hashtags = [];
    this.idioma = 'en';
    this.hashtags_btn = true;

    this.list_save = [];
    this.textarea_comentarios = [];
  }

  ionViewDidLoad() { }

  closeModal(): void {
    this.viewController.dismiss();
  }

  contadorHashtag() {
    if (this.hashtag_tex) {
      var arr = this.hashtag_tex.split("#");
      return arr.length - 1;
    }
    return 0;
  }

  catalogoImg() {
    if (this.option == 'I') {
      this.URLS[0].PAGINA = 1;
      let url: string = this.URLS[0].URL + this.URLS[0].PAGINA + this.URLS[0].QUERY + this.img_tex.replace(/\s/g, "+") + this.URLS[0].CLIENTE_ID;
      this.httpProvider.getTem(url).then((res) => {
        this.res = res;
        this.imagenes = this.res.results;
      }).catch(err => console.log('err: ', JSON.stringify(err)));
    } else {
      this.URLS[1].PAGINA = 1;
      let url: string = this.URLS[1].URL + this.URLS[1].PAGINA + this.URLS[1].QUERY + this.img_tex + this.URLS[1].CLIENTE_ID;
      this.httpProvider.getTem(url).then((res) => {
        this.res = res;
        this.videos = this.res.hits;
      }).catch(err => console.log('err: ' + JSON.stringify(err)));
    }
  }

  cargarMas() {
    this.spinner1 = true;
    if (this.option == 'I') {
      this.URLS[0].PAGINA = this.URLS[0].PAGINA + 1;
      let url: string = this.URLS[0].URL + this.URLS[0].PAGINA + this.URLS[0].QUERY + this.img_tex + this.URLS[0].CLIENTE_ID;
      this.httpProvider.getTem(url).then((res) => {
        this.res = res;
        this.imagenes = this.imagenes.concat(this.res.results);
      }).catch(err => console.log('err: ', JSON.stringify(err)));
    } else {
      this.URLS[1].PAGINA = this.URLS[1].PAGINA + 1;
      let url: string = this.URLS[1].URL + this.URLS[1].PAGINA + this.URLS[1].QUERY + this.img_tex + this.URLS[1].CLIENTE_ID;
      this.httpProvider.getTem(url).then((res) => {
        this.res = res;
        this.videos = this.videos.concat(this.res.hits);
      }).catch(err => {
        console.log('err: ', JSON.stringify(err));
      });
    }
    this.spinner1 = false;
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
      this.img = "data:image/jpeg;base64," + imageData;
      this.video = undefined;
      this.whizar[1] = "#745af2";
      this.img_catalogo = false;
    }, err => {
      console.log(JSON.stringify(err));
    });
  }

  tomarVideo() {
    this.img = undefined;
    let options: CaptureVideoOptions = {
      limit: 1,
      duration: 30
    }
    this.mediaCapture.captureVideo(options).then((res: MediaFile[]) => {
      this.video = res[0].fullPath;
      this.poster = res[0].fullPath;
      this.whizar[1] = "#745af2";
      this.img_catalogo = false;
    }, (err) => {
      console.log(JSON.stringify(err));
    });
  }

  selectImg(ruta: string, poster: string = null) {
    if (this.option == 'I') {
      this.video = undefined;
      this.img = ruta;
    } else {
      this.poster = this.getPoster(poster);
      let url: string = "http://35.232.20.49/advansocialvideo.php?id=" + poster + "&src=" + ruta;
      this.img = undefined;
      this.video = undefined;
      this.httpProvider.getTem(url).then((res) => {
        this.res = res;
        this.video = this.res.url;
      }).catch(err => console.log('err: ' + JSON.stringify(err)));
    }
    this.whizar[1] = "#745af2";
    this.img_catalogo = false;
  }

  reset(): void {
    this.hashtag_tex = undefined;
    this.hashtag_tex = undefined;
    this.comentario_tex = undefined;
    this.img_tex = undefined;
    this.res = undefined;
    this.spinner1 = undefined;
    this.img = undefined;
    this.video = undefined;
    this.poster = undefined;
    this.whizar = [
      '#745af2', null, null
    ];
    this.option = 'I';
    this.img_catalogo = true;
    this.imagenes = [];
    this.videos = [];
    this.busqueda = undefined;
    this.hashtag_selected = [];
    this.hashtags = [];
    this.idioma = 'en';
    this.hashtags_btn = true;

    this.post_guardados = undefined;
    this.list_save = [];
    this.textarea_comentarios = [];
  }

  getPoster(picture_id: string) {
    return "https://i.vimeocdn.com/video/" + picture_id + "_640x360.jpg";
  }

  catalogoHashtag() {
    this.hashtag_selected = [];
    let url: string = "https://api.datamuse.com/words?ml=" + this.busqueda.replace(/\s/g, "+"); + "&v=" + this.idioma;
    this.httpProvider.getTem(url).then((res) => {
      this.res = res;
      this.res.forEach(() => {
        this.hashtag_selected.push(true);
      }, this);
      this.hashtags = this.res;
    }).catch(err => console.log('err: ', JSON.stringify(err)));
  }

  replaceEspacio(text: string) {
    var t = text.replace(/\s/g, "")
    return t;
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

  nex() {
    this.hashtags_btn = !this.hashtags_btn;
    if (this.hashtags_btn == false) {
      this.whizar[2] = "#745af2";
    } else {
      this.whizar[2] = null;
    }
  }

  compartir() {
    this.load = this.globalProvider.cargando(this.globalProvider.data.msj.load);
    var file: string;
    var a: string = `
    .
    .
    .
    The Entrepreneurs Technology: https://advansales.com
    .
    .
    .`;
    //var text: string
    if (this.hashtag_tex) {
      var tem = this.hashtag_tex.split('#');
      var mitad: number = Math.round(tem.length / 2);
      console.log(mitad)
      //this.hashtag_tex = '';     
      tem.forEach((element, index) => {
        if (index == 0) {
          this.comentario_tex += a + element + ' ';
        } else {
          this.comentario_tex += "#" + element;
        }
        if (index == mitad) {
          console.log('insert')
          this.comentario_tex += "#advansales ";
        }
      }, this);
    } else {
      this.comentario_tex + a + "#advansales";
    }

    console.log(this.comentario_tex);
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
    if (this.option == "I") {
      var t = "http://35.232.20.49/advansocialimg.php?src=" + this.img;
      file = t.replace(/&/g, "<->");
    } else if (this.option == "IG") {
      file = this.img;
    } else {
      file = this.video;
    }
    var tex = this.comentario_tex;
    this.comentario_tex = '';
    //console.log('t :  ' + file);
    this.socialSharing.share(tex, null, file, null).then(() => {
      this.reset();
      this.load.dismiss();
    }).catch(err => {
      this.load.dismiss();
      console.log('err: ' + JSON.stringify(err));
    });
  }

  getAdvanSocial() {
    this.load = this.globalProvider.cargando(this.globalProvider.data.msj.load)
    this.post_guardados = true;
    let url: string = "servicio=getAdvanSocial&id_usuario= " + this.globalProvider.usuario.id_usuario;
    this.httpProvider.get(url).then((res) => {
      this.load.dismiss();
      this.res = res;
      if (this.res.error == 'false') {
        this.res.advansocial.forEach(element => {
          this.textarea_comentarios.push(element.comentario + ' ' + element.hashtag);
        }, this);
        this.list_save = this.res.advansocial;
      }
    }).catch(err => console.log('err: ' + JSON.stringify(err)));
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
            let url: string = "servicio=setEliminarAdvanSocial&id_advansocial=" + id_advansocial;
            this.httpProvider.get(url).then((res) => {
              this.res = res;
              //this.globalProvider.alerta(this.res.msn);
              if (this.res.error == 'false') {
                this.getAdvanSocial();
              } else {
                this.globalProvider.alerta(this.res.msn);
              }
            }).catch(err => console.log('err: ' + JSON.stringify(err)));
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
    let data: any = {
      id_usuario: this.globalProvider.usuario.id_usuario,
      comentario: this.comentario_tex,
      hashtag: this.hashtag_tex,
      tipo: tipo,
      url: ruta
    };

    this.httpProvider.post(data, url).then((res) => {
      this.load.dismiss();
      this.res = res;
      if (this.res.error == 'false') {
        this.reset();
      } else {
        this.globalProvider.alerta(this.res.msn)
      }
    }).catch(err => console.log('err: ' + JSON.stringify(err)));
  }

  setEditAdvanSocial(social: any, i: number) {
    console.log(this.textarea_comentarios[i])
    var tem = this.textarea_comentarios[i].split('#')
    var comentarios = tem[0];
    var hashtag: string = '';
    tem.forEach((element, index) => {
      if (index > 0) {
        hashtag += "#" + element ;
      }
    });

    let url: string = "servicio=setEditAdvanSocial";
    let data: any = {
      id_advansocial: social.id_advansocial,
      comentario: comentarios,
      hashtag: hashtag,
      tipo: social.tipo,
      url: social.url
    }

    this.httpProvider.post(data, url).then((res) => {
      this.res = res;
      if (this.res.error == 'false') {
        this.getAdvanSocial();
      } else {
        this.globalProvider.alerta(this.res.msn);
      }
    }).catch(err => console.log(JSON.stringify(err)));
  }

  compartirSave(social: any) {
    console.log("comentario : " + social.comentario + ' hashtag: ' + social.hashtag + ' url: ' + social.url);
  }
}