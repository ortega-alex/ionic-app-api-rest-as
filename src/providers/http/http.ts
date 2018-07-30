import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class HttpProvider {

  constructor(public http: HttpClient) { }

  // produccion
  public url = 'http://35.232.20.49/servicio.php?';
  //local public url = 'http://localhost/power_dialer/servicio.php?';
  // desarrollo
  //public url = 'http://35.232.20.49/desarrollo/servicio.php?';
  // si panel
  //public url : string = "https://openfut.com/advansales/servicio.php?"
  //public url : string = "http://intercorps.org/advansales/servicio.php?"

  post(data, url) {
    return new Promise((resolve, reject) => {
      try {
        this.http.post(this.url + url, JSON.stringify(data))
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
        this.http.get(this.url + param).subscribe(data => {
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