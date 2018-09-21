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
    private viewController : ViewController
  ) {
    this.tutoriales = [];
  }

  ionViewDidLoad() {
    this.getTutorialPlateforma();
  }

  getTutorialPlateforma() {
    var dispositivo = (this.globalProvider.dispositivo == true) ? 'android' : 'ios';
    let url = 'servicio=getTutorialPlateforma&plataforma=' + dispositivo;
    this.httpProvider.get(url).then((res: any) => {
      this.tutoriales = res.tutorial;
    }).catch(err => console.log('err: ' + JSON.stringify(err)));
  }

  closeModal() {
    this.viewController.dismiss();
  }
}
