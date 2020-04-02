import {Component} from '@angular/core';
import {Platform, NavController} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {BluetoothLE} from '@ionic-native/bluetooth-le/ngx';
import {DatabaseService} from './service/database.service';
import {LoadingService} from './service/loading.service';
import {AuthService} from './service/auth.service';
@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss']
})
export class AppComponent {
    constructor(
        private platform: Platform,
        private splashScreen: SplashScreen,
        private statusBar: StatusBar,
        private bluetoothLE: BluetoothLE,
        private databaseService: DatabaseService,
        private authService: AuthService,
        private loadingService: LoadingService,
        private navCtrl: NavController
    ) {
        this.initializeApp();

    }

    async initializeApp() {

        try {
            await this.platform.ready();
            this.statusBar.styleDefault();
            if (this.platform.is('android')) {
                await this.permission();
            }
            await this.loadingService.presentLoading('Connecting to data base.');
            await this.databaseService.createDatabase();
            await this.authService.connect();
            await this.loadingService.dismiss();
            await this.navCtrl.navigateRoot('/scan');
        } catch (e) {
            console.log('Error initialising app');
            throw new Error('Error initialising app');
        }
    }

    async permission() {

        try {
            const hasPermissionResult = await this.bluetoothLE.hasPermission();
            if (hasPermissionResult.hasPermission === false) {
                await this.bluetoothLE.requestPermission();
            }
            const isLocationEnabledResult = await this.bluetoothLE.isLocationEnabled();
            if (isLocationEnabledResult.isLocationEnabled === false) {
                await this.bluetoothLE.requestLocation();
            }
        } catch (e) {
            console.log('Error getting Permission');
            throw new Error('Error getting Permission');
        }
    }
}
