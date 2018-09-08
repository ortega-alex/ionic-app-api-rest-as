import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, Content, Platform } from 'ionic-angular';
import { InAppPurchase2, IAPProduct } from '@ionic-native/in-app-purchase-2';
import { GlobalProvider } from '../../providers/global/global';
import { HttpProvider } from '../../providers/http/http';

@IonicPage()
@Component({
  selector: 'page-producto',
  templateUrl: 'producto.html',
})
export class ProductoPage {
  @ViewChild(Content) content: Content;

  combos: Array<any>;
  degradante: string;
  bordes: Array<{ combo: number, pago: Array<boolean> }> = [];
  contador: number;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private viewController: ViewController,
    private store: InAppPurchase2,
    private globalProvider: GlobalProvider,
    private httpProvider: HttpProvider,
    private platform : Platform
  ) {
    this.contador = 0;
    this.combos = [];
    this.getComboProducto();
  }

  ionViewDidLoad() {
  }

  ionViewWillUnload() {
    this.platform.registerBackButtonAction(() => {
      this.platform.exitApp();
    });
  }

  closeModal() {
    this.viewController.dismiss();
  }

  pagoSelec(i: number) {
    this.bordes[this.contador].pago.forEach((pago, i) => {
      if (pago == true) {
        this.bordes[this.contador].pago[i] = false;
      }
    }, this);
    this.bordes[this.contador].pago[i] = !this.bordes[this.contador].pago[i];
  }

  getComboProducto() {
    let dispositivo: string = (this.globalProvider.dispositivo == true) ? 'android' : 'ios';
    let url: string = "servicio=getComboProducto";
    let data = {
      "id_usuario": this.globalProvider.usuario.id_usuario,
      "plataforma": dispositivo
    };
    this.httpProvider.post(data, url).then((res: Array<any>) => {
      this.combos = res;
      this.combos.forEach((combo, i) => {
        let array: Array<boolean> = [];
        combo.forma_pagos.forEach((forma, j) => {
          if (j == 1) {
            array.push(true);
            this.bordes.push({ combo: i, pago: array });
          } else {
            array.push(false);
            this.bordes.push({ combo: i, pago: array });
          }
        })
      }, this);
      this.content.resize();
    }).catch(err => console.log('err: ' + err));
  }

  async purchase() {
    var arg: any;
    var order: any;
    this.bordes[this.contador].pago.forEach((pago, index) => {
      if (pago == true) {
        arg = {
          id_producto: this.combos[this.contador].forma_pagos[index].id_producto,
          id_producto_antiguo: this.combos[this.contador].forma_pagos[index].id_producto_antiguo
        }
      }
    }, this);

    this.configurePurchasing(arg);

    console.log('Products: ' + JSON.stringify(this.store.products));
    try {
      let product = this.store.get(arg.id_producto);
      console.log('product: ' + JSON.stringify(product));

      if (arg.id_producto_antiguo != null && arg.id_producto_antiguo.trim() != '') {
        order = await this.store.order(arg.id_producto, arg.id_producto_antiguo ? { oldPurchasedSkus: [arg.id_producto_antiguo] } : null);
      } else {
        order = await this.store.order(arg.id_producto);
      }
      console.log('order: ' + JSON.stringify(order));
    } catch (err) {
      console.log('Error Ordering ' + JSON.stringify(err));
    }
  }

  async configurePurchasing(arg: any) {
    try {
      //this.store.verbosity = this.store.INFO;

      this.store.register({
        id: arg.id_producto,
        alias: arg.id_producto,
        type: this.store.PAID_SUBSCRIPTION,
      });

      this.registerHandlers(arg)

      this.store.ready((status) => {
        console.log('Store is Ready: ' + JSON.stringify(status));
      });

      this.store.when(arg.id_producto).error((error) => {
        console.log('An Error Occured' + JSON.stringify(error));
      });

      this.store.refresh();
    } catch (err) {
      console.log('Error On Store Issues' + JSON.stringify(err));
    }
  }

  registerHandlers(arg: any) {
    this.store.when(arg.id_producto).approved((product: IAPProduct) => {
      console.log('approved: ' + JSON.stringify(product));
      this.setComboProducto(product, arg);
      product.verify();
    });

    this.store.when(arg.id_producto).registered((product: IAPProduct) => {
      console.log('Registered: ' + JSON.stringify(product));
    });

    this.store.when(arg.id_producto).updated((product: IAPProduct) => {
      console.log('Loaded' + JSON.stringify(product));
    });

    this.store.when(arg.id_producto).cancelled((product: IAPProduct) => {
      console.log('Purchase was Cancelled');
    });

    this.store.when(arg.id_producto).owned((product: IAPProduct) => {
      console.log('owned: ' + JSON.stringify(product));
      this.setComboProducto(product, arg);
    });

    this.store.when(arg.id_producto).verified((product: IAPProduct) => {
      console.log('verified' + JSON.stringify(product));
      product.finish();
    });

    this.store.error((err) => {
      console.log('Store Error ' + JSON.stringify(err));
    });
  }

  setComboProducto(product: any, arg: any) {
    let dispositivo: string = (this.globalProvider.dispositivo == true) ? 'android' : 'ios';
    let url: string = "servicio=setComboProducto";
    let data: any = {
      "id_usuario": this.globalProvider.usuario.id_usuario,
      "plataforma": dispositivo,
      "id_producto": product.id,
      "id_producto_antiguo": arg.id_producto_antiguo,
      "token": product.transaction.purchaseToken
    };
    console.log(url);
    this.httpProvider.post(data, url).then(() => {
      this.getComboProducto();
      this.globalProvider.setProductoId(product.id);
    }).catch(err => console.log('err: ' + JSON.stringify(err)));
  }
}