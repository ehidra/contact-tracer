import {Component} from '@angular/core';
import {Platform} from '@ionic/angular';
import {BluetoothleService} from '../service/bluetoothle.service';
import {DevicesService} from '../service/devices.service';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage {
    private devices: any = [];
    private myDevice: any = null;


    constructor(
        private bluetoothleService: BluetoothleService,
        private devicesService: DevicesService,
        private platform: Platform) {

    }

    ionViewWillEnter() {
        this.platform.ready().then((readySource) => {
            this.devicesService.getUUID().then((uuid: any) => {
                this.myDevice = uuid;
                console.log('Getting UUID: ' + this.myDevice);
                this.bluetoothleService.initializeCentral(this.myDevice);
            }, (error) => {
                console.log('error getting UUID: ' + JSON.stringify(error));
                this.delay(2000).then((successTimeout) => {
                    this.ionViewWillEnter();
                }, (errorTimeout) => {
                    this.ionViewWillEnter();
                });
            });
        });
    }


    private delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getAllDevices() {
        this.devicesService.getAll().then(deviceList => {
            this.devices = deviceList;
        });
    }

    cleanDevices() {
        this.devicesService.truncate();
        this.getAllDevices();
    }

}
