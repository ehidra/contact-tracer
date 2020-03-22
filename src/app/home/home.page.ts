import {Component} from '@angular/core';
import {DevicesService} from '../service/devices.service';
import {Platform} from '@ionic/angular';
import {BluetoothLE} from '@ionic-native/bluetooth-le/ngx';
import {DatePipe} from '@angular/common';
import {BluetoothSerial} from '@ionic-native/bluetooth-serial/ngx';
import {UniqueDeviceID} from '@ionic-native/unique-device-id/ngx';

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
        private bluetoothSerial: BluetoothSerial,
        private uniqueDeviceID: UniqueDeviceID) {

        this.platform.ready().then((readySource) => {
            this.uniqueDeviceID.get().then((uuid: any) => {
                this.myDevice = uuid;
                console.log('Getting UUID: ' + this.myDevice);
            }, (error) => {
                console.log('error getting UUID: ' + JSON.stringify(error));
            });


            const config = {
                request: true,
                statusReceiver: true,
                restoreKey: 'bluetoothlecontacttracer'
            };
            this.bluetoothLE.initialize(config).subscribe(ble => {
                // console.log('ble', ble.status); // logs 'enabled'
                // this.adapterInfo();
                this.devicesService.truncate();
                this.startScan();
            });

            this.peripheral();

        });
    }

    peripheral() {

        const configPeripheral = {
            request: true,
            restoreKey: 'bluetoothlecontacttracerperipheral'
        };
        this.bluetoothLE.initializePeripheral(configPeripheral).subscribe((success) => {
            console.log('initializePeripheral: ' + JSON.stringify(success));

            if (success.status === 'readRequested') {

                const slicedData = this.myDevice.slice(success.offset);
                const encodedBytes = this.bluetoothLE.stringToBytes(slicedData);
                const encodedString = this.bluetoothLE.bytesToEncodedString(encodedBytes);
                const params = {
                    address: success.address,
                    requestId: success.requestId,
                    value: encodedString
                };
                this.bluetoothLE.respond(params).then((successRespond) => {
                    console.log('successRespond: ' + JSON.stringify(successRespond));
                }, (errorRespond) => {
                    console.log('Respond Error: ' + JSON.stringify(errorRespond));
                });
            }

        }, (error) => {
            console.log('initializePeripheralError: ' + JSON.stringify(error));
        });

        const characteristics = {
            service: '1234',
            characteristics: [
                {
                    uuid: 'ABCD',
                    permissions: {
                        read: true,
                        write: true,
                        // readEncryptionRequired: true,
                        // writeEncryptionRequired: true,
                    },
                    properties: {
                        read: true,
                        writeWithoutResponse: true,
                        write: true,
                        notify: true,
                        indicate: true,
                        // authenticatedSignedWrites: true,
                        // notifyEncryptionRequired: true,
                        // indicateEncryptionRequired: true,
                    }
                }
            ]
        };


        this.bluetoothLE.addService(characteristics).then((successAddService) => {
            console.log('Peripheral addService: ' + JSON.stringify(successAddService));
        }, (errorAddService) => {
            console.log('Peripheral addService Error: ' + JSON.stringify(errorAddService));
        });


    }

    startAdvertisingPeripheral() {
        const params = {
            services: ['1234'], // iOS
            service: '1234', // Android
            name: 'Contact Tracer',
        };
        this.bluetoothLE.startAdvertising(params).then((successStartAdvertising) => {
            console.log('Peripheral startAdvertising: ' + JSON.stringify(successStartAdvertising));
        }, (errorStartAdvertising) => {
            console.log('Peripheral startAdvertising Error: ' + JSON.stringify(errorStartAdvertising));
        });
    }

    startScan() {

        this.isScanning = true;
        const params = {
            services: ['1234'],
            allowDuplicates: false,
        };
        this.bluetoothLE.startScan(params).subscribe((success) => {
            console.log('startScan: ' + JSON.stringify(success));
            if (success.status === 'scanResult') {

                this.stopScan();
                const paramsConnect = {
                    address: success.address
                };
                this.bluetoothLE.connect(paramsConnect).subscribe((successConnect) => {
                    console.log('connect: ' + JSON.stringify(successConnect));

                    if (successConnect.status === 'connected') {

                        const discoverParam = {
                            address: success.address,
                            clearCache: true
                        };
                        this.bluetoothLE.discover(discoverParam).then((successDiscover) => {
                            console.log('services: ' + JSON.stringify(successDiscover));

                            const readParam = {
                                address: success.address,
                                service: '1234',
                                characteristic: 'ABCD'
                            };
                            this.bluetoothLE.read(readParam).then((successRead) => {
                                console.log('read: ' + JSON.stringify(successRead));
                                if (successRead.status === 'read') {

                                    const byteString = this.bluetoothLE.encodedStringToBytes(successRead.value);
                                    const devideUUid = this.bluetoothLE.bytesToString(byteString);
                                    const device = {
                                        address: devideUUid,
                                        name: 'Carlos'
                                    }
                                    this.addDevice(device);
                                    console.log('Vamosss' + devideUUid);
                                }

                            }, (errorRead) => {
                                console.log(' read error: ' + JSON.stringify(errorRead));
                            });
                        }, (errorDiscover) => {
                            console.log(' discover error: ' + JSON.stringify(errorDiscover));
                        });


                    }
                    if (successConnect.status === 'disconnected') {
                        const closeParams = {
                            address: success.address
                        };
                        this.bluetoothLE.close(closeParams).then((successClose) => {
                            console.log('close: ' + JSON.stringify(successClose));

                        }, (errorClose) => {
                            console.log(' close error: ' + JSON.stringify(errorClose));
                        });
                    }

                }, (errorConnect) => {
                    console.log('connect Error: ' + JSON.stringify(errorConnect));
                    const closeParams = {
                        address: success.address
                    };
                    this.bluetoothLE.close(closeParams).then((successClose) => {
                        console.log('close: ' + JSON.stringify(successClose));

                    }, (errorClose) => {
                        console.log(' close error: ' + JSON.stringify(errorClose));
                    });
                });
            }
        }, (error) => {
            console.log('error: ' + JSON.stringify(error));
        });
        // this.discoverUnpaired();
        // this.delay(15000).then((resultFirstDelay) => {
        //        this.stopScan();
        //       this.delay(5000).then((resultSecondDelay) => {
        //                this.startScan();
        //            }, (error) => {
        //            }
        //        );
        //    }, (error) => {
        //    }
        // );
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
        const dateString = this.datePipe.transform(dateNow, 'yyyy-MM-dd');
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


    adapterInfo() {
        this.bluetoothLE.getAdapterInfo().then((adapterInfo) => {
            this.myDevice = adapterInfo;
            // console.log('startScan: ' + JSON.stringify(this.myDevice));
        });
    }


}
