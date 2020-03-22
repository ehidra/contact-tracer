import {Component} from '@angular/core';
import {Platform} from '@ionic/angular';
import {BluetoothleService} from '../service/bluetoothle.service';
import {DevicesService} from '../service/devices.service';
import {UniqueDeviceID} from '@ionic-native/unique-device-id/ngx';

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
        private platform: Platform,
        private uniqueDeviceID: UniqueDeviceID) {

        this.platform.ready().then((readySource) => {
            this.uniqueDeviceID.get().then((uuid: any) => {
                this.myDevice = uuid;
                console.log('Getting UUID: ' + this.myDevice);

                this.bluetoothleService.initializeCentral();
                this.bluetoothleService.initializePeripheral(this.myDevice);

            }, (error) => {
                console.log('error getting UUID: ' + JSON.stringify(error));
            });
        });
    }


    private delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    checkIfScanning() {
        return this.bluetoothleService.isScanning;
    }

    startScan() {
        this.bluetoothleService.startScan();
    }

    stopScan() {
        this.bluetoothleService.stopScan();
    }

    startAdvertisingPeripheral() {
        this.bluetoothleService.advertisePeripheral();
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
