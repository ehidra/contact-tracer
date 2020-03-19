import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';
import {BackgroundMode} from '@ionic-native/background-mode/ngx';
import {IonicModule, IonicRouteStrategy} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {SQLite} from '@ionic-native/sqlite/ngx';
import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {AndroidPermissions} from '@ionic-native/android-permissions/ngx';
import {BluetoothLE} from '@ionic-native/bluetooth-le/ngx';
@NgModule({
    declarations: [AppComponent],
    entryComponents: [],
    imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule],
    providers: [
        StatusBar,
        SplashScreen,
        {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
        BackgroundMode,
        SQLite,
        AndroidPermissions,
        BluetoothLE
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
