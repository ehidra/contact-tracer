import {Component} from '@angular/core';
import {DevicesService} from '../service/devices.service';
import {Platform} from '@ionic/angular';
import {BluetoothLE} from '@ionic-native/bluetooth-le/ngx';
import {DatePipe} from '@angular/common';
import {Device} from '@ionic-native/device/ngx';
import {BluetoothSerial} from '@ionic-native/bluetooth-serial/ngx';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage {

    private devices: any = [];
    private myDevice: object = null;
    private isScanning = false;

    constructor(
        private devicesService: DevicesService,
        private bluetoothLE: BluetoothLE,
        private platform: Platform,
        private datePipe: DatePipe,
        private device: Device,
        private bluetoothSerial: BluetoothSerial) {

        this.platform.ready().then((readySource) => {
            // console.log('Platform ready from', readySource);
            // console.log("Device info:" + this.device.manufacturer + this.device.platform + this.device.serial);
            const config = {
                request: true,
                statusReceiver: true,
                restoreKey: 'bluetoothlesavetheworld'
            };
            this.bluetoothLE.initialize(config).subscribe(ble => {
                // console.log('ble', ble.status); // logs 'enabled'
                this.adapterInfo();
                this.devicesService.truncate();
                this.startScan();
            });

        });
    }

    adapterInfo() {
        this.bluetoothLE.getAdapterInfo().then((adapterInfo) => {
            this.myDevice = adapterInfo;
            // console.log('startScan: ' + JSON.stringify(this.myDevice));
        });
    }

    startScan() {

        this.isScanning = true;
        const params = {
            services: [],
            allowDuplicates: false,
        };
        this.bluetoothLE.startScan(params).subscribe((success) => {
            console.log('startScan: ' + JSON.stringify(success));
            if (success.status === 'scanResult') {
                this.addDevice(success);
            }
        }, (error) => {
            console.log('error: ' + JSON.stringify(error));
        });
        this.discoverUnpaired();
        this.delay(5000).then((result) => {
                this.stopScan();
                this.delay(5000).then((result) => {
                        this.startScan();
                    }, (error) => {
                    }
                );
            }, (error) => {
            }
        );
    }

    discoverUnpaired() {
        this.bluetoothSerial.discoverUnpaired().then((success) => {
            console.log('discoverUnpaired: ' + JSON.stringify(success));
            var uniqueDeviceList = [];
            var uniqueDeviceObjectList = [];
            success.forEach(device => {
                if (uniqueDeviceList.indexOf(device.address) === -1) {
                    uniqueDeviceList.push(device.address);
                    uniqueDeviceObjectList.push(device);
                }
            });
            uniqueDeviceObjectList.forEach(device => {
                this.addDevice(device);
            });
        }, (error) => {
            console.log(' discoverUnpaired error: ' + JSON.stringify(error));
        });
    }

    private delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    stopScan() {
        this.bluetoothLE.stopScan().then((resp) => {
            // console.log('stopScan: ' + JSON.stringify(resp));
            this.isScanning = false;
        });
    }

    addDevice(device) {
        const dateNow = Date.now();
        const dateString = this.datePipe.transform(dateNow, 'yyyy-mm-dd');
        const timeString = this.datePipe.transform(dateNow, 'hh:mm:ss');
        this.devicesService.create({
            device: device.address,
            device_name: device.name,
            date_found: dateString,
            time_found: timeString
        });

    }

    getAll() {
        this.devicesService.getAll().then(deviceList => {
            this.devices = deviceList;
        });
    }

    clean() {
        this.devicesService.truncate();
        this.getAll();
    }

}
