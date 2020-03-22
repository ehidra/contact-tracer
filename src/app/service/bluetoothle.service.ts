import {Injectable} from '@angular/core';
import {DatePipe} from '@angular/common';
import {DevicesService} from '../service/devices.service';
import {BluetoothLE} from '@ionic-native/bluetooth-le/ngx';
import {Platform} from '@ionic/angular';

@Injectable({
    providedIn: 'root'
})
export class BluetoothleService {

    private isScannig = false;

    constructor(private bluetoothLE: BluetoothLE,
                private devicesService: DevicesService,
                private datePipe: DatePipe,
                private platform: Platform) {

    }

    initializeCentral() {

        // Initialise the central service for the bluetoothle
        const config = {
            request: true,
            statusReceiver: false,
            restoreKey: 'bluetoothlecontacttracercentral'
        };
        console.log(' Initialize params ' + JSON.stringify(config));
        this.bluetoothLE.initialize(config).subscribe(successInitialize => {
            console.log('Initialize: ' + JSON.stringify(successInitialize));
            // start the scan of devices BLE
            if (successInitialize.status === 'enabled') {
                this.startScan();
            } else if (successInitialize.status === 'disabled') {

                if (this.platform.is('android')) {
                    this.bluetoothLE.enable();
                    this.startScan();
                }
            }
        }, (errorInitialize) => {
            console.log('Error Initialize: ' + JSON.stringify(errorInitialize));
        });
    }

    initializePeripheral(UUID) {
        // Initialise the peripheral service for the bluetoothle
        const configPeripheral = {
            request: true,
            restoreKey: 'bluetoothlecontacttracerperipheral'
        };

        // everytime the peripheral is interacted with , it will call this function
        this.bluetoothLE.initializePeripheral(configPeripheral).subscribe((successInitializePeripheralResult) => {

            console.log('initializePeripheral: ' + JSON.stringify(successInitializePeripheralResult));

            if (successInitializePeripheralResult.status === 'enabled') {
                // We create the Blueetoothle service
                const characteristics = {
                    service: '1234',
                    characteristics: [
                        {
                            uuid: '2ab4aacd-ccea-4cf8-9f27-a25fe60ac5f0',
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
                    this.advertisePeripheral();
                }, (errorAddService) => {
                    console.log('Peripheral addService Error: ' + JSON.stringify(errorAddService));
                });
            }

            // If read request received just send the phone UUID so we now who is in the other end
            if (successInitializePeripheralResult.status === 'readRequested') {

                // We have to slice the string as Bluetooth got limitations but it handles by its own
                const slicedData = UUID.slice(successInitializePeripheralResult.offset);
                const encodedBytes = this.bluetoothLE.stringToBytes(slicedData);
                const encodedString = this.bluetoothLE.bytesToEncodedString(encodedBytes);
                const params = {
                    address: successInitializePeripheralResult.address,
                    requestId: successInitializePeripheralResult.requestId,
                    value: encodedString
                };
                this.bluetoothLE.respond(params).then((successRespond) => {
                    console.log('successRespond: ' + JSON.stringify(successRespond));
                }, (errorRespond) => {
                    console.log('Respond Error: ' + JSON.stringify(errorRespond));
                });
            }

        }, (errorInitializePeripheralResult) => {
            console.log('initializePeripheralError: ' + JSON.stringify(errorInitializePeripheralResult));
        });


    }

    advertisePeripheral() {
        this.startAdvertising();
        // this.delay(15000).then((resultFirstDelay) => {
        //        this.advertisePeripheral();
        //    }, (error) => {
        //    }
        // );
    }


    startAdvertising() {
        const params = {
            services: ['1234'], // iOS
            service: '1234', // Android
            name: 'Contact Tracer'
        };
        this.bluetoothLE.startAdvertising(params).then((successStartAdvertising) => {
            console.log('Peripheral startAdvertising: ' + JSON.stringify(successStartAdvertising));
        }, (errorStartAdvertising) => {
            console.log('Peripheral startAdvertising Error: ' + JSON.stringify(errorStartAdvertising));
        });
    }

    stopAdvertisingPeripheral() {
        this.bluetoothLE.isAdvertising().then((successIsAdvertising) => {
            console.log('Peripheral isAdvertising : ' + JSON.stringify(successIsAdvertising));
            const successIsAdvertisingObject = JSON.parse(JSON.stringify(successIsAdvertising));
            if (successIsAdvertisingObject.isAdvertising === true) {

                this.bluetoothLE.stopAdvertising().then((successStopAdvertising) => {
                    console.log('Peripheral stopAdvertising: ' + JSON.stringify(successStopAdvertising));
                }, (errorStopAdvertising) => {
                    console.log('Peripheral stopAdvertising Error: ' + JSON.stringify(errorStopAdvertising));
                });
            } else {
                console.log('Peripheral already stopped');
            }

        }, (errorIsAdvertising) => {
            console.log('Peripheral isAdvertising Error: ' + JSON.stringify(errorIsAdvertising));
        });
    }

    isScanning() {
        this.bluetoothLE.isScanning().then((successIsScanning) => {
            console.log('isScanning: ' + JSON.stringify(successIsScanning));

            this.isScannig = successIsScanning.isScanning;
        }, (errorIsScanning) => {
            console.log('isScanning Error: ' + JSON.stringify(errorIsScanning));
        });

    }


    startScan() {
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
                this.connectToDevice(paramsConnect);
                // this.startScan();
            }
        }, (error) => {
            console.log('error: ' + JSON.stringify(error));
        });
    }

    connectToDevice(paramsConnect, numberTries = 0) {

        this.bluetoothLE.connect(paramsConnect).subscribe((successConnect) => {
            console.log('connect: ' + JSON.stringify(successConnect));
            const closeParams = {
                address: paramsConnect.address
            };
            if (successConnect.status === 'connected') {
                this.readUUIDConnectedDevice(successConnect.address);

            }
            if (successConnect.status === 'disconnected') {
                this.bluetoothLE.close(closeParams).then((successClose) => {
                    console.log('close: ' + JSON.stringify(successClose));

                }, (errorClose) => {
                    console.log(' close error: ' + JSON.stringify(errorClose));
                });
            }


        }, (errorConnect) => {
            console.log('connect Error: ' + JSON.stringify(errorConnect));
            // numberTries++;

            const closeParams = {
                address: paramsConnect.address
            };
            this.bluetoothLE.close(closeParams).then((successClose) => {
                console.log('close: ' + JSON.stringify(successClose));
                // if (numberTries < 2) {
                //     this.connectToDevice(paramsConnect, numberTries);
                //  }
            }, (errorClose) => {
                console.log(' close error: ' + JSON.stringify(errorClose));
            });
            this.startScan();
        });
    }

    readUUIDConnectedDevice(addressDevice) {
        const discoverParam = {
            address: addressDevice,
            clearCache: true
        };
        this.bluetoothLE.discover(discoverParam).then((successDiscover) => {
            console.log('services: ' + JSON.stringify(successDiscover));

            const readParam = {
                address: addressDevice,
                service: '1234',
                characteristic: '2ab4aacd-ccea-4cf8-9f27-a25fe60ac5f0'
            };
            this.bluetoothLE.read(readParam).then((successRead) => {
                console.log('read: ' + JSON.stringify(successRead));
                if (successRead.status === 'read') {

                    const byteString = this.bluetoothLE.encodedStringToBytes(successRead.value);
                    const devideUUid = this.bluetoothLE.bytesToString(byteString);
                    const device = {
                        address: devideUUid,
                        name: 'Carlos'
                    };
                    this.addDevice(device);
                    console.log('Vamosss' + devideUUid);
                    this.bluetoothLE.close(readParam).then((successClose) => {
                        console.log('close: ' + JSON.stringify(successClose));
                        this.startScan();
                    }, (errorClose) => {
                        console.log(' close error: ' + JSON.stringify(errorClose));
                        this.startScan();
                    });
                }


            }, (errorRead) => {
                console.log(' read error: ' + JSON.stringify(errorRead));
                this.startScan();
            });
        }, (errorDiscover) => {
            console.log(' discover error: ' + JSON.stringify(errorDiscover));
            this.startScan();
        });
    }

    stopScan() {
        this.bluetoothLE.stopScan().then((successStopScan) => {
            // console.log('stopScan: ' + JSON.stringify(resp));
        }, (errorStopScan) => {
            console.log('StopScan Error: ' + JSON.stringify(errorStopScan));
        });
    }


    private delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    private addDevice(device) {
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

}
