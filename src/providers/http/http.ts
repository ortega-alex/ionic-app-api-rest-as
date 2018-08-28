import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class HttpProvider {

  constructor(public http: HttpClient) { }

  // produccion
  public URL = 'http://35.232.20.49/servicio.php?';
  public URL_IMG: string = "http://35.232.20.49/advansocialimg.php?src=";
  public URL_VIDEO: string = "http://35.232.20.49/advansocialvideo.php?id=";
  public URL_VCARD : string = "https://advansales.com/vCard.php?u=";

  //local 
 /*
  public URL = 'http://192.168.1.57/power_dialer/servicio.php?';
  public URL_IMG : string = "http://192.168.1.57/power_dialer/imgAdvansales.php?src=";
  public URL_VCARD : string = "http://192.168.1.57/power_dialer/vCard.php?u=";
*/

  //public URL_IMG: string = "http://35.232.20.49/imgAdvansales.php?src=";


  // desarrollo
  //public URL = 'http://35.232.20.49/desarrollo/servicio.php?';
  //public URL_IMG: string = "http://35.232.20.49/desarrollo/advansocialimg.php?src=";
  //public URL_VIDEO: string = "http://35.232.20.49/desarrollo/advansocialvideo.php?id=";
  
  // si panel
  //public URL : string = "https://openfut.com/advansales/servicio.php?"
  //public URL : string = "http://intercorps.org/advansales/servicio.php?"
 
  post(data, url) {
    return new Promise((resolve, reject) => {
      try {
        this.http.post(this.URL + url, JSON.stringify(data))
          .subscribe(res => {
            resolve(res);
          }, (err) => {
            reject(err);
          });
      } catch (error) {
        reject(error);
      }
    });
  }

  get(param) {
    return new Promise((resolve, reject) => {
      try {
        this.http.get(this.URL + param).subscribe(data => {
          resolve(data);
        }, error => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  getTem(url: string) {
    return new Promise((resolve, reject) => {
      try {
        this.http.get(url).subscribe(data => {
          resolve(data);
        }, error => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}