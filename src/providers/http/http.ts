import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class HttpProvider {

  constructor(public http: HttpClient) { }

  // produccion
  public URL = 'http://35.232.20.49/servicio.php?';
  //local 
  //public url = 'http://192.168.1.57/power_dialer/servicio.php?';
  // desarrollo
  //public url = 'http://35.232.20.49/desarrollo/servicio.php?';
  // si panel
  //public url : string = "https://openfut.com/advansales/servicio.php?"
  //public url : string = "http://intercorps.org/advansales/servicio.php?"

  //public img : string = "http://192.168.1.57/power_dialer/imgAdvansales.php?src=";
  //public URL_IMG: string = "http://35.232.20.49/imgAdvansales.php?src=";

  public URL_IMG: string = "http://35.232.20.49/advansocialimg.php?src=";
  public URL_VIDEO: string = "http://35.232.20.49/advansocialvideo.php?id=";
  public URL_HASTAG: string = "https://api.datamuse.com/words?ml=";

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