import {Component} from '@angular/core';
import {BackgroundMode} from '@ionic-native/background-mode/ngx';
import {Platform} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {SQLite, SQLiteObject} from '@ionic-native/sqlite/ngx';
import {DevicesService} from './service/devices.service';
import {BluetoothLE} from '@ionic-native/bluetooth-le/ngx';
import {AndroidPermissions} from '@ionic-native/android-permissions/ngx';

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
        private sqlite: SQLite,
        private devicesService: DevicesService,
        private bluetoothLE: BluetoothLE,
        private androidPermissions: AndroidPermissions
    ) {
        this.initializeApp();
    }

    initializeApp() {
        this.platform.ready().then(() => {
            this.statusBar.styleDefault();
            this.splashScreen.hide();
            this.permission();
            this.backgroundMode.setDefaults({ silent: true });
            this.backgroundMode.enable();
            this.createDatabase();
        });
    }

    private createDatabase() {
        this.sqlite.create({
            name: 'data.db',
            location: 'default' // the location field is required
        })
            .then((db) => {
                this.devicesService.setDatabase(db);
                return this.devicesService.createTable();
            })
            .then(() => {
                console.log('Data base set up correctly');
            })
            .catch(error => {
                console.error(error);
            });
    }

    private permission() {


        this.bluetoothLE.hasPermission().then(
            hasPermissionSuccess => {
                console.log('Has permission?', JSON.stringify(hasPermissionSuccess));
                if (hasPermissionSuccess.hasPermission === false) {
                    this.bluetoothLE.requestPermission().then(
                        requestPermission => {
                            console.log('Otorgado?', JSON.stringify(requestPermission));
                        },
                        requestPermissionError => {
                            console.log('requestPermissionError.');
                        });
                }
            },
            hasPermissionError => {
                console.log('hasPermissionError');
            });


        this.bluetoothLE.isLocationEnabled().then(
            locationEnable => {
                console.log('Otorgado?', JSON.stringify(locationEnable));
                if (locationEnable.isLocationEnabled === false) {
                    this.bluetoothLE.requestLocation().then(
                        requestLocation => {
                            console.log('Otorgado?', JSON.stringify(requestLocation));
                        },
                        requestPermissionError => {
                            console.log('requestLocationError.');
                        });
                }
            },
            locationEnableError => {
                console.log('locationEnable.');
            });
    }
}
