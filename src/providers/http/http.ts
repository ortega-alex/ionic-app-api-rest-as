import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class HttpProvider {

  constructor(public http: HttpClient) { }

  // produccion
  public URL: string = 'https://advansales.com/servicio.php?';
  public URL_IMG: string = "https://advansales.com/advansocialimg.php?src=";
  public URL_VIDEO: string = "https://advansales.com/advansocialvideo.php?id=";
  public URL_VCARD: string = "https://advansales.com/vCard.php?u=";
  public RUTA_IMG: string = "https://advansales.com/imgAdvansales.php?src=";

  post(data: Object, url: string) {
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