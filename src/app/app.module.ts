import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { PerfilPage } from '../pages/perfil/perfil';
import { LoginPage } from '../pages/login/login';
import { RegistroPage } from '../pages/registro/registro';

import { GlobalProvider } from '../providers/global/global';
import { HttpProvider } from '../providers/http/http';

import { FileChooser } from '@ionic-native/file-chooser';
import { FilePath } from '@ionic-native/file-path';
import { File } from '@ionic-native/file';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';
import { IonicStorageModule } from '@ionic/storage';
import { CallNumber } from '@ionic-native/call-number';
import { SMS } from '@ionic-native/sms';
import { Calendar } from '@ionic-native/calendar';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { CallLog } from '@ionic-native/call-log';
import { Contacts } from '@ionic-native/contacts';
import { AdMobFree } from '@ionic-native/admob-free';
import { Push } from '@ionic-native/push';
import { Facebook } from '@ionic-native/facebook';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    PerfilPage,
    LoginPage,
    RegistroPage,
  ],
  imports: [
    BrowserModule,
    HttpModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    PerfilPage,
    LoginPage,
    RegistroPage,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    GlobalProvider,
    HttpProvider,
    FileChooser,
    FilePath,
    File,
    FileTransfer,
    FileTransferObject,
    HttpProvider,
    GlobalProvider,
    CallNumber,
    SMS,
    Calendar,
    AndroidPermissions,
    CallLog,
    Contacts,
    AdMobFree,
    Push,
    Facebook
  ]
})
export class AppModule { }