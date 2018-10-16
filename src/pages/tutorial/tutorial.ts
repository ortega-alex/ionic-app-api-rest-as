import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { HttpProvider } from '../../providers/http/http';
import { GlobalProvider } from '../../providers/global/global';
import { Tutorial } from '../../model/interfaces';

@IonicPage()
@Component({
  selector: 'page-tutorial',
  templateUrl: 'tutorial.html',
})
export class TutorialPage {

  tutoriales: Array<Tutorial>;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private httpProvider: HttpProvider,
    private globalProvider: GlobalProvider,
    private viewController: ViewController
  ) {
    this.tutoriales = [];
  }

  ionViewDidLoad() {
    this.getTutorialPlateforma();
  }

  getTutorialPlateforma() {
    var dispositivo = (this.globalProvider.dispositivo == true) ? 'android' : 'ios';
    let url: string = 'servicio=getTutorialPlateforma&plataforma=' + dispositivo +
      "&lg=" + this.globalProvider.idioma.key;
    this.httpProvider.get(url).then((res: any) => {
      this.tutoriales = res.tutorial;
    }).catch(err => console.log('err: ', err.toString()));
  }

  closeModal() {
    this.viewController.dismiss();
  }

  goUrl(url: string = null) { 
    if (url == null) {  
      window.location.href = "https://advansales.com/chat.php?k= " + this.globalProvider.usuario.id_usuario;
    } else {
      window.location.href = url;
    }   
  }
}
