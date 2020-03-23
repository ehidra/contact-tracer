import {Injectable} from '@angular/core';
import {DatePipe} from '@angular/common';
import {DevicesService} from '../service/devices.service';
import {BluetoothLE} from '@ionic-native/bluetooth-le/ngx';
import {Platform} from '@ionic/angular';

@Injectable({
    providedIn: 'root'
})
export class BluetoothleService {

    private connectedTries = [];
    private myDevice = null;

    constructor(private bluetoothLE: BluetoothLE,
                private devicesService: DevicesService,
                private datePipe: DatePipe,
                private platform: Platform) {

    }

    // START PERIPHERAL CODE
    initializePeripheral() {
        // Initialise the peripheral service for the bluetoothle
        const configPeripheral = {
            request: true,
            restoreKey: 'bluetoothlecontacttracerperipheral'
        };

        // everytime the peripheral is interacted with , it will call this function
        this.bluetoothLE.initializePeripheral(configPeripheral).subscribe((successInitializePeripheralResult) => {
            if (successInitializePeripheralResult.status === 'enabled') {

                console.log('initializePeripheral: ' + JSON.stringify(successInitializePeripheralResult));
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
                }, (errorAddService) => {
                    console.log('Peripheral addService Error: ' + JSON.stringify(errorAddService));
                });
            }

            // If read request received just send the phone UUID so we now who is in the other end
            if (successInitializePeripheralResult.status === 'readRequested') {

                // We have to slice the string as Bluetooth got limitations but it handles by its own
                const slicedData = this.myDevice.slice(successInitializePeripheralResult.offset);
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

    startAdvertising() {
        const params = {
            services: ['1234'], // iOS
            service: '1234', // Android
            name: 'Contact Tracer',
            connectable: true,
            mode: 'lowLatency',
            timeout: 1000,
            txPowerLevel: 'high'
        };
        this.bluetoothLE.startAdvertising(params).then((successStartAdvertising) => {
            console.log('Peripheral startAdvertising: ' + JSON.stringify(successStartAdvertising));
        }, (errorStartAdvertising) => {
            console.log('Peripheral startAdvertising Error: ' + JSON.stringify(errorStartAdvertising));
        });

        this.delay(10000).then((successTimeout) => {
            this.stopAdvertising();
        }, (errorTimeout) => {
            console.log('Perfipheral Timeout Error: ' + JSON.stringify(errorTimeout));
        });
    }

    stopAdvertising() {
        this.bluetoothLE.stopAdvertising().then((successstopAdvertising) => {
            console.log('Peripheral stopAdvertising: ' + JSON.stringify(successstopAdvertising));
            this.manageScanCycle();
        }, (errorStopAdvertising) => {
            console.log('Peripheral stopAdvertising Error: ' + JSON.stringify(errorStopAdvertising));
            this.manageScanCycle();
        });
    }

    // END PERIPHERAL CODE
    // START CENTRAL CODE

    initializeCentral(myDevice) {

        this.myDevice = myDevice;
        // Initialise the central service for the bluetoothle
        const config = {
            request: true,
            statusReceiver: true,
            restoreKey: 'bluetoothlecontacttracercentral'
        };
        console.log(' Initialize params ' + JSON.stringify(config));
        this.bluetoothLE.initialize(config).subscribe(successInitialize => {
            console.log('Initialize: ' + JSON.stringify(successInitialize));
            // start the scan of devices BLE
            if (successInitialize.status === 'enabled') {

                this.initializePeripheral();
                this.manageScanCycle();

            } else if (successInitialize.status === 'disabled') {

                if (this.platform.is('android')) {
                    this.bluetoothLE.enable();
                }
                this.initializeCentral(this.myDevice);
            }
        }, (errorInitialize) => {
            console.log('Error Initialize: ' + JSON.stringify(errorInitialize));
        });


    }

    manageScanCycle() {
        this.startScan();
        this.delay(15000).then((successTimeoutScan) => {
            this.stopScan().then((successStopScan) => {
                console.log('StopScan Success: ' + JSON.stringify(successStopScan));
                this.startAdvertising();
            }, (errorStopScan) => {
                console.log('StopScan Error: ' + JSON.stringify(errorStopScan));
            });
        }, (errorTimeoutScan) => {
            console.log('Scan Timeout Error: ' + JSON.stringify(errorTimeoutScan));
        });
    }


    startScan() {
        this.connectedTries = [];
        const params = {
            services: ['1234'],
            allowDuplicates: false,
            scanMode: this.bluetoothLE.SCAN_MODE_LOW_POWER,
            matchMode: this.bluetoothLE.MATCH_MODE_AGGRESSIVE,
            matchNum: this.bluetoothLE.MATCH_NUM_MAX_ADVERTISEMENT,
            callbackType: this.bluetoothLE.CALLBACK_TYPE_ALL_MATCHES
        };
        this.bluetoothLE.startScan(params).subscribe((successStartScan) => {

            if (successStartScan.status === 'scanResult') {
                // console.log('startScan: ' + JSON.stringify(successStartScan));

                const paramsConnect = {
                    address: successStartScan.address
                };
                this.connectToDevice(paramsConnect);
            }
        }, (errorStartScan) => {
            console.log('error Start Scan: ' + JSON.stringify(errorStartScan));
        });
    }

    connectToDevice(paramsConnect, numberTries = 0) {
        if (!this.connectedTries.includes(paramsConnect.address)) {
            this.connectedTries.push(paramsConnect.address)
            console.log('Trying to connect to: ' + JSON.stringify(paramsConnect));
            this.bluetoothLE.connect(paramsConnect).subscribe((successConnect) => {
                console.log('connect: ' + JSON.stringify(successConnect));

                if (successConnect.status === 'connected') {
                    this.readUUIDConnectedDevice(successConnect.address);
                }
                if (successConnect.status === 'disconnected') {
                    const closeParams = {
                        address: paramsConnect.address
                    };
                    this.closeConnection(closeParams);
                }

            }, (errorConnect) => {
                console.log('connect Error: ' + JSON.stringify(errorConnect));
                const disconnectParams = {
                    address: paramsConnect.address
                };
                this.disconnectAndClose(disconnectParams);
            });


            // this.delay(7000).then((successTimeout) => {
            //    const disconnectParams = {
            //         address: paramsConnect.address
            //    };
            //    this.bluetoothLE.disconnect(disconnectParams).then((successDisconnect) => {
            //        console.log('Disconnect: ' + JSON.stringify(successDisconnect));
            //    }, (errorDisconnect) => {
            //        console.log(' Disconnect error: ' + JSON.stringify(errorDisconnect));
            //        const closeParams = {
            //            address: paramsConnect.address
            //       };
            //        this.closeConnection(closeParams);
            //    });
            // }, (errorTimeout) => {
            //   console.log('Connect Timeout Error: ' + JSON.stringify(errorTimeout));
            //    const closeParams = {
            //        address: paramsConnect.address
            //    };
            //    this.closeConnection(closeParams);
            // });
        }


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
                    this.disconnectAndClose(discoverParam);
                }


            }, (errorRead) => {
                console.log(' read error: ' + JSON.stringify(errorRead));
                this.disconnectAndClose(discoverParam);
            });
        }, (errorDiscover) => {
            console.log(' discover error: ' + JSON.stringify(errorDiscover));
            this.disconnectAndClose(discoverParam);
        });
    }

    disconnectAndClose(disconnectParams) {
        this.bluetoothLE.disconnect(disconnectParams).then((successDisconnect) => {
            console.log('Disconnect: ' + JSON.stringify(successDisconnect));
            const closeParams = {
                address: disconnectParams.address
            };
            this.closeConnection(closeParams);
        }, (errorDisconnect) => {
            console.log(' Disconnect error: ' + JSON.stringify(errorDisconnect));
            const closeParams = {
                address: disconnectParams.address
            };
            this.closeConnection(closeParams);
        });
    }


    closeConnection(closeParams) {
        this.bluetoothLE.close(closeParams).then((successClose) => {
            console.log('close: ' + JSON.stringify(successClose));
            // const index = this.connectedTries.indexOf(closeParams.address, 0);
            // if (index > -1) {
            //    this.connectedTries.splice(index, 1);
            // }

        }, (errorClose) => {
            console.log(' close error: ' + JSON.stringify(errorClose));
        });
    }

    stopScan() {
        return this.bluetoothLE.stopScan();
    }

    // END CENTRAL CODE
    // PRIVATE FUNCTIONS

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
