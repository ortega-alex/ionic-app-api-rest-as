import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ModalIosPage } from '../pages/sms/sms';
import { LoginPage } from '../pages/login/login';
import { RegistroPage } from '../pages/registro/registro';
import { SocialPage } from '../pages/social/social';
import { VcardPage } from '../pages/vcard/vcard';
import { ProductoPage } from  '../pages/producto/producto';
import { TutorialPage } from '../pages/tutorial/tutorial';

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
import { IOSFilePicker } from '@ionic-native/file-picker';
import { InAppPurchase2 } from '@ionic-native/in-app-purchase-2';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Clipboard } from '@ionic-native/clipboard';
import { Camera } from '@ionic-native/camera';
import { MediaCapture } from '@ionic-native/media-capture';
import { AppRate } from '@ionic-native/app-rate';
import { ColorPickerModule } from 'ngx-color-picker';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    //PerfilPage,
    TutorialPage,
    LoginPage,
    RegistroPage,
    SocialPage,
    VcardPage,
    ProductoPage,
    ModalIosPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    ColorPickerModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    TutorialPage,
    LoginPage,
    RegistroPage,
    SocialPage,
    VcardPage,
    ProductoPage,
    ModalIosPage
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
    Facebook,
    IOSFilePicker,
    InAppPurchase2,
    SocialSharing,
    Clipboard,
    Camera,
    MediaCapture,
    AppRate
  ]
})
export class AppModule { }