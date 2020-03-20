import {Component} from '@angular/core';
import {DevicesService} from '../service/devices.service';
import {Platform} from '@ionic/angular';
import {BluetoothLE} from '@ionic-native/bluetooth-le/ngx';
import {DatePipe} from '@angular/common';
import {Device} from '@ionic-native/device/ngx';
import {BluetoothSerial} from '@ionic-native/bluetooth-serial/ngx';
import {UniqueDeviceID} from '@ionic-native/unique-device-id/ngx';
import {IBeacon} from '@ionic-native/ibeacon/ngx';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage {

    private devices: any = [];
    private myDevice: any = null;
    private isScanning = false;
    private beaconData = {};


    constructor(
        private devicesService: DevicesService,
        private bluetoothLE: BluetoothLE,
        private platform: Platform,
        private datePipe: DatePipe,
        private device: Device,
        private bluetoothSerial: BluetoothSerial,
        private uniqueDeviceID: UniqueDeviceID,
        private ibeacon: IBeacon) {

        this.platform.ready().then((readySource) => {
            // console.log('Platform ready from', readySource);
            // console.log("Device info:" + this.device.manufacturer + this.device.platform + this.device.serial);

            this.uniqueDeviceID.get().then((uuid: any) => {
                this.myDevice = uuid;
                console.log('Getting UUID: ' + this.myDevice);
                this.iBeaconStart();

            }, (error) => {
                console.log('error getting UUID: ' + JSON.stringify(error));
            });

            //
            // const config = {
            //    request: true,
            //    statusReceiver: true,
            //    restoreKey: 'bluetoothlecontacttracer'
            // };
            // this.bluetoothLE.initialize(config).subscribe(ble => {
            //    // console.log('ble', ble.status); // logs 'enabled'
            //    this.adapterInfo();
            //    this.devicesService.truncate();
            //    this.startScan();
            // });

        });
    }

    adapterInfo() {
        this.bluetoothLE.getAdapterInfo().then((adapterInfo) => {
            this.myDevice = adapterInfo;
            // console.log('startScan: ' + JSON.stringify(this.myDevice));
        });
    }

    iBeaconStart() {
        // Request permission to use location on iOS
        this.ibeacon.requestAlwaysAuthorization().then((response) => {
            // create a new delegate and register it with the native layer
            const delegate = this.ibeacon.Delegate();

            // Subscribe to some of the delegate's event handlers
            delegate.didRangeBeaconsInRegion()
                .subscribe(
                    data => console.log('Beacon didRangeBeaconsInRegion: ', JSON.stringify(data)),
                    error => console.error()
                );
            delegate.didStartMonitoringForRegion()
                .subscribe(
                    data => console.log('Beacon didStartMonitoringForRegion: ', JSON.stringify(data)),
                    error => console.error()
                );
            delegate.didEnterRegion()
                .subscribe(
                    data => {
                        console.log('Beacon didEnterRegion: ', JSON.stringify(data));
                        this.beaconData = data;
                    }
                );

            delegate.didExitRegion().subscribe(
                (data) => {
                    console.log('Beacon didExitRegion: ', JSON.stringify(data));
                }
            );
            const beaconRegion = this.ibeacon.BeaconRegion('contact-tracer-beacon', this.myDevice);

            this.ibeacon.startMonitoringForRegion(beaconRegion)
                .then(
                    () => console.log('Beacon Native layer received the request to monitoring'),
                    error => console.error('Beacon Native layer failed to begin monitoring: ', JSON.stringify(error))
                );

            this.ibeacon.startRangingBeaconsInRegion(beaconRegion)
                .then(() => {
                    console.log('Beacon Started ranging beacon region: ', JSON.stringify(beaconRegion));
                })
                .catch((error: any) => {
                    console.error('Beacon  to start ranging beacon region: ', JSON.stringify(beaconRegion));
                });

        }, (error) => {

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
        this.delay(5000).then((resultFirstDelay) => {
                this.stopScan();
                this.delay(5000).then((resultSecondDelay) => {
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
            const uniqueDeviceList = [];
            const uniqueDeviceObjectList = [];
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
