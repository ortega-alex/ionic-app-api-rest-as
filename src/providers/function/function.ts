import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Calendario } from '../../model/interfaces';
import { CallNumber } from '@ionic-native/call-number';
import { Contacts, Contact, ContactField, ContactName, ContactOrganization } from '@ionic-native/contacts';
import { SMS } from '@ionic-native/sms';
import { Replace, FechaPosterios, Numerico } from '../../pipes/filtros/filtros';
import { Calendar } from '@ionic-native/calendar'

@Injectable()
export class FunctionProvider {

  private replace = new Replace();
  private fechaPosterios = new FechaPosterios()
  private numerico = new Numerico();

  constructor(
    public http: HttpClient,
    private callNumber: CallNumber,
    private contacts: Contacts,
    private sms: SMS,
    private calendar: Calendar
  ) { }

  call(telefono: string, campania: string = null, nombre: string = null, nuevo: boolean = false) {
    if (telefono != null && telefono.trim() != '') {
      this.callNumber.callNumber(telefono, true).then(() => {
        if (nuevo == true) {
          this.setContacto(telefono, nombre, campania);
        }
      });
    }
  }

  setContacto(telefono: string, nombre: string, campania: string) {
    let contact: Contact = this.contacts.create();
    contact.name = new ContactName(null, nombre, 'AS');
    contact.nickname = campania;
    contact.organizations = [new ContactOrganization(null, campania, null)];
    contact.phoneNumbers = [new ContactField('mobile', this.numerico.transform(telefono))];
    contact.save().then(() => console.log('Contact saved!', contact),
      (error: any) => console.error('Error saving contact.', error)
    );
  }

  setSms(telefono: string, text: string) {
    this.sms.send(this.numerico.transform(telefono), text);
  }

  setCalendar(calendario: Calendario) {
    var startDate = new Date(this.replace.transform(calendario.fecha));
    this.calendar.createEvent(
      calendario.titulo,
      'AdvanSales',
      'name: ' + calendario.nombre + ' , phone: ' + this.numerico.transform(calendario.telefono) + ' , note: ' + calendario.nota,
      startDate,
      this.fechaPosterios.transform(startDate, 1)
    ).then(() => {
      console.log('success');
    }).catch(err => console.log('err: ', err.toString()));
  }

  removeContact(nombre: string, arr: Array<any> = []) {
    if (arr.length > 0) {
      nombre = arr[0].texto_referencia
    }
    var options = {
      filter: "AS",
      organizations: nombre,
      nickname: nombre,
      multiple: true,
      hasPhoneNumber: true
    };
    this.contacts.find(["*"], options).then((res: any) => {
      res = res.filter(function (current) {
        var exists = current.nickname == nombre;
        return exists;
      });
      for (let r of res) {
        r.remove();
      }

      if (arr.length > 0) {
        arr.shift()
        if (arr.length > 0) {
          this.removeContact(null, arr)
        }
      }
    });
  }
}
