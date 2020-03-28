import {Component} from '@angular/core';
import {BackgroundMode} from '@ionic-native/background-mode/ngx';
import {Platform} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {BluetoothLE} from '@ionic-native/bluetooth-le/ngx';
import {DatabaseService} from './service/database.service';
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
        private backgroundMode: BackgroundMode,
        private bluetoothLE: BluetoothLE,
        private databaseService: DatabaseService,
        private authService: AuthService
    ) {
        this.initializeApp();
    }

    initializeApp() {
        this.platform.ready().then(() => {
            this.statusBar.styleDefault();
            this.backgroundMode.setDefaults({silent: true});
            if (this.platform.is('android')) {
                this.permission();
            }
            this.databaseService.createDatabase();
            this.blockUntilDbReady();
            this.backgroundMode.enable();
            this.splashScreen.hide();
        });
    }

    blockUntilDbReady() {
        if (this.databaseService.ready === false) {
            this.delay(1000).then((successTimeoutScan) => {
                this.blockUntilDbReady();
            }, (errorTimeoutScan) => {
                console.log('DB block until ready Timeout Error: ' + JSON.stringify(errorTimeoutScan));
            });
        } else {
            this.authService.connect();
        }
    }

    private delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    permission() {

        this.bluetoothLE.hasPermission().then(
            successHasPermission => {
                console.log('hasPermission?' + JSON.stringify(successHasPermission));
                if (successHasPermission.hasPermission === false) {
                    this.bluetoothLE.requestPermission().then(
                        successRequestPermission => {
                            console.log('successRequestPermission' + JSON.stringify(successRequestPermission));
                        },
                        requestPermissionError => {
                            console.log('requestPermissionError' + JSON.stringify(requestPermissionError));
                        });
                }
            },
            errorHasPermission => {
                console.log('errorHasPermission' + JSON.stringify(errorHasPermission));
            });


        this.bluetoothLE.isLocationEnabled().then(
            successLocationEnable => {
                console.log('isLocationEnabled?' + JSON.stringify(successLocationEnable));
                if (successLocationEnable.isLocationEnabled === false) {
                    this.bluetoothLE.requestLocation().then(
                        successRequestLocation => {
                            console.log('requestLocation' + JSON.stringify(successRequestLocation));
                        },
                        errorRequestLocation => {
                            console.log('Error RequestLocation' + JSON.stringify(errorRequestLocation));
                        });
                }
            },
            errorLocationEnable => {
                console.log('locationEnableError' + JSON.stringify(errorLocationEnable));
            });
    }
}
