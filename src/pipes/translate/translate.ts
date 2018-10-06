import { Pipe, PipeTransform } from '@angular/core';
import { GlobalProvider } from '../../providers/global/global';

@Pipe({
  name: 'translate',
})
export class TranslatePipe implements PipeTransform {

  constructor(private globalProvider: GlobalProvider) { }

  /*transform(value: string, ...args) {
    if (this.globalProvider.idioma && this.globalProvider.idioma.key != null && this.globalProvider.idioma.contenido[value]) {
      return this.globalProvider.idioma.contenido[value]
    }
    return value;
  }*/

  transform(value: string, ...args) {
    if (this.globalProvider.idioma) {
      return this.globalProvider.idioma.contenido[value]
    }
    return value;
  }
}
