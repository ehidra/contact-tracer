import {Injectable} from '@angular/core';
import {SQLiteObject} from '@ionic-native/sqlite';
import {v4 as uuidv4} from 'uuid';

@Injectable({
    providedIn: 'root'
})
export class DevicesService {

    db: SQLiteObject = null;

    constructor() {
    }

    // public methods

    setDatabase(db: SQLiteObject) {
        if (this.db === null) {
            this.db = db;
        }
    }

    create(device: any) {

        const sql = 'INSERT INTO devices(uuid, rssi, date_found, time_found) VALUES(?,?,?,?)';
        this.db.executeSql(sql, [device.uuid, device.rssi, device.date_found, device.time_found]);
        console.log('created a device-time ' + sql);
        // this.getDevice(device).then(deviceResult => {
        //
        // if (deviceResult.length > 0) {
        //                   const dbDevice = deviceResult[0];
        //                  device.id = dbDevice.id;
        //                  this.update(device);
        //                 console.log('updated a device');
        //             } else {
        //                const sql = 'INSERT INTO devices(device,device_name, date_found, time_found) VALUES(?,?,?,?)';
        //                this.db.executeSql(sql, [device.device, device.device_name, device.date_found, device.time_found]);
        //                console.log('created a device');
        //           }
        //        }
        //     );
    }

    createTable() {
        const settingSql = 'CREATE TABLE IF NOT EXISTS settings(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT,value TEXT);';
        this.db.executeSql(settingSql, []).then((successSettingSql) => {
                const deviceSql = 'CREATE TABLE IF NOT EXISTS devices(id INTEGER PRIMARY KEY AUTOINCREMENT, uuid TEXT,rssi INTEGER, date_found DATE, time_found TIME );';
                this.db.executeSql(deviceSql, []).then((successDeviceSql) => {
                        this.truncate();
                    },
                    (errorDeviceSql) => {

                    });
            },
            (errorSettingSql) => {

            });
    }

    delete(device: any) {
        const sql = 'DELETE FROM devices WHERE id=?';
        return this.db.executeSql(sql, [device.id]);
    }

    truncate() {
        // const settingsSql = 'DELETE FROM settings';
        // this.db.executeSql(settingsSql, []);
        const sql = 'DELETE FROM devices';
        return this.db.executeSql(sql, []);
    }

    getAll() {
        const sql = 'SELECT * FROM devices';
        return this.db.executeSql(sql, [])
            .then(response => {
                const devices = [];
                for (let index = 0; index < response.rows.length; index++) {
                    devices.push(response.rows.item(index));
                }
                return Promise.resolve(devices);
            })
            .catch(error => Promise.reject(error));
    }

    getDevice(device) {

        const sql = 'SELECT * FROM devices WHERE uuid = ' + '\'' + device.device + '\'';
        return this.db.executeSql(sql, [])
            .then(response => {
                console.log('does exists: ' + JSON.stringify(response));
                const devices = [];
                for (let index = 0; index < response.rows.length; index++) {
                    devices.push(response.rows.item(index));
                }
                return Promise.resolve(devices);
            })
            .catch(error => Promise.reject(error));
    }

    update(device: any) {
        const sql = 'UPDATE devices SET uuid=?, SET rssi=?, date_found=?,  time_found=? WHERE id=?';
        return this.db.executeSql(sql, [device.uuid, device.rssi, device.date_found, device.time_found, device.id]);
    }

    getUUID() {
        const sql = 'SELECT * FROM settings WHERE name = \'uuid\'';
        return this.db.executeSql(sql, [])
            .then(response => {
                console.log('uuid: ' + JSON.stringify(response));
                let uuid = null;
                if (response.rows.length === 0) {
                    uuid = uuidv4();
                    const uuidSql = 'INSERT INTO settings(name, value) VALUES(?,?)';
                    this.db.executeSql(uuidSql, ['uuid', uuid]);
                } else {
                    for (let index = 0; index < response.rows.length; index++) {
                        const uuidObject = response.rows.item(index);
                        uuid = uuidObject.value;
                    }
                }
                return Promise.resolve(uuid);
            })
            .catch(error => {
                Promise.reject(error);
            });
    }


}
