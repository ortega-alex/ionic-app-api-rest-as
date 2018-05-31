import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'Mayusculas',
})

export class Mayusculas implements PipeTransform {
  transform(value: string, ...args) {
    return value.toUpperCase();
  }
}

@Pipe({
  name: 'Minusculas',
})

export class Minusculas implements PipeTransform {
  transform(value: string, ...args) {
    return value.toLowerCase();
  }
}

@Pipe({
  name: 'isEmail',
})

export class isEmail implements PipeTransform {
  transform(value: string, ...args) {
    var re = /\S+@\S+\.\S+/;
    return re.test(value);
  }
}

@Pipe({
  name: "Numerico",
})

export class Numerico implements PipeTransform {
  transform(value: string, ...args) {
    return value.replace(/[^\d]/gi, '');
  }
}

@Pipe({
  name: "Replace",
})

export class Replace implements PipeTransform {
  transform(value: string, ...args) {
    return value.replace(/T|Z/gi, ' ');
  }
}

@Pipe({
  name: "Fechas",
})

export class Fechas implements PipeTransform {
  transform(value: Date, ...args) {
    var monthNames = [
      "01", "02", "03",
      "04", "05", "06", "07",
      "08", "09", "10",
      "11", "12"
    ];
    var day = (value.getDate() <= 9) ? '0' + value.getDate() : value.getDate();
    var monthIndex = value.getMonth();
    var year = value.getFullYear();
    var cadena = value.toString();
    return year + '-' + monthNames[monthIndex] + '-' + day + 'T' + cadena.substr(16, 8);
  }
}

@Pipe({
  name: "Fecha",
})

export class Fecha implements PipeTransform {
  transform(value: Date, ...args) {
    var monthNames = [
      "01", "02", "03",
      "04", "05", "06", "07",
      "08", "09", "10",
      "11", "12"
    ];
    var day = (value.getDate() <= 9) ? '0' + value.getDate() : value.getDate();
    var monthIndex = value.getMonth();
    var year = value.getFullYear();
    return year + '-' + monthNames[monthIndex] + '-' + day;
  }
}

@Pipe({
  name: "Hora",
})

export class Hora implements PipeTransform {
  transform(value: Date, ...args) {
    var cadena = value.toString();
    return cadena.substr(16, 5);
  }
}

@Pipe({
  name: "getMilisegundos",
})

export class getMilisegundos implements PipeTransform {
  transform(value: Date, ...args) {
    return value.getTime();
  }
}

@Pipe({
  name: "setMilisegundos",
})

export class setMilisegundos implements PipeTransform {
  transform(value: string, ...args) {
    let n = parseInt(value);
    var fecha = new Date(n);
    return fecha;
  }
}

@Pipe({
  name: "FechaAnterior",
})

export class FechaAnterior implements PipeTransform {
  transform(value: Date, horas: number, ...args) {
    return new Date(value.getTime() - horas * 60 * 60 * 1000);
  }
}

@Pipe({
  name: "FechaPosterios",
})

export class FechaPosterios implements PipeTransform {
  transform(value: Date, horas: number, ...args) {
    return new Date(value.getTime() + horas * 60 * 60 * 1000);
  }
}

@Pipe({
  name: "SetTimeDate",
})

export class SetTimeDate implements PipeTransform {
  transform(value: Date, ...args) {
    var time = new Date(value.getTime() + 1 * 60 * 60 * 1000);
    return time.getTime();
  }
}

@Pipe({
  name: "Diferencia",
})

export class Diferencia implements PipeTransform {
  transform(value: number, ...args) {
    var ms = value % 1000;
    value = (value - ms) / 1000;
    var secs = value % 60;
    value = (value - secs) / 60;
    var mins = value % 60;
    var hrs = (value - mins) / 60;
    return { hora: hrs, minuto: mins, segundo: secs };
  }
}