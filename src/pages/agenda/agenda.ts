import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { GlobalProvider } from '../../providers/global/global';
import { HttpProvider } from '../../providers/http/http';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SMS } from '@ionic-native/sms';
import { Contacts, Contact, ContactField, ContactName, ContactOrganization } from '@ionic-native/contacts';
import { Numerico } from '../../pipes/filtros/filtros';

@IonicPage()
@Component({
  selector: 'page-agenda',
  templateUrl: 'agenda.html',
})
export class AgendaPage {

  fromContent: FormGroup;
  submitted: boolean;
  list: string;
  lists: Array<{ id_campania_manual: number, nombre: string, is_contacto: string }>;
  texto: string;
  valid: { isset_vcard: string, vcard_msn: string, vcard_producto: string };
  numerico = new Numerico()

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private viwController: ViewController,
    private globalProvider: GlobalProvider,
    private httpProvider: HttpProvider,
    private fromBuilder: FormBuilder,
    private sms: SMS,
    private contacts: Contacts
  ) {
    this.submitted = false;
    this.fromContent = this.fromBuilder.group({
      texto: ["", Validators.required],
      numero: ["", Validators.required],
      nombre: ["", Validators.required],
      id_campania_manual: [""],
      is_contacto: [""],
      id_usuario: [""],
      guardar_predeterminado: ["Y"]
    });
    this.lists = [];
    this.getDrawAgenda();
    this.valid = { isset_vcard: null, vcard_msn: null, vcard_producto: null };
  }

  ionViewDidLoad() { }

  closeModal(res: boolean = false) {
    this.viwController.dismiss(res);
  }

  chekedSms(event) {
    this.fromContent.value.guardar_predeterminado = (event.value == true) ? "Y" : "N";
  }

  private getDrawAgenda() {
    let url: string = "servicio=getDrawAgenda&id_usuario=" + this.globalProvider.usuario.id_usuario;
    this.httpProvider.get(url).then((res: any) => {
      if (res.error == "false") {
        this.texto = res.texto;
        this.lists = res.leads;
        this.lists.forEach((element, index) => {
          if (index == 0) {
            this.list = element.id_campania_manual + "+" + element.is_contacto
          }
        }, this);
        this.valid = { isset_vcard: res.isset_vcard, vcard_msn: res.vcard_msn, vcard_producto: res.vcard_producto }
      } else {
        this.globalProvider.alerta(res.msn);
      }
    }).catch(err => console.log("err: " + JSON.stringify(err)))
  }

  setAgenda() {
    this.submitted = true;
    if (this.fromContent.valid) {
      var array = this.list.split("+");
      this.fromContent.value.is_contacto = array[1];
      this.fromContent.value.id_campania_manual = array[0];
      this.fromContent.value.id_usuario = this.globalProvider.usuario.id_usuario;
      this.envioSms();
    }
  }

  envioSms() {
    let load = this.globalProvider.cargando(this.globalProvider.data.msj.load);
    this.sms.send(this.numerico.transform(this.fromContent.value.numero.toString()), this.fromContent.value.texto.toString()).then(() => {
      load.dismiss();
      let url: string = "servicio=setAgenda";
      this.httpProvider.post(this.fromContent.value, url).then((res: any) => {
        if (res.error == "false") {
          this.setContacto();
          this.closeModal(true);
        } else {
          this.globalProvider.alerta(res.msn);
        }
      }).catch((err) => {
        load.dismiss();
        console.log("err http: " + JSON.stringify(err));
      });
    }).catch((err) => {
      load.dismiss();
      this.globalProvider.alerta("It could not send!");
      console.log("err sms: " + JSON.stringify(err));
    });
  }

  setContacto() {
    var nombre_campania: string;
    this.lists.forEach((element, ) => {
      if (this.fromContent.value.id_campania_manual == element.id_campania_manual) {
        nombre_campania = element.nombre
      }
    });
    let contact: Contact = this.contacts.create();
    contact.name = new ContactName(null, this.fromContent.value.nombre, 'AS');
    contact.nickname = nombre_campania;
    contact.organizations = [new ContactOrganization(null, nombre_campania, null)];
    contact.phoneNumbers = [new ContactField('mobile', this.fromContent.value.numero)];
    contact.save().catch(err => console.log('err: ' + JSON.stringify(err)));
  }
}