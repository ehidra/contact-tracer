import {Injectable} from '@angular/core';
import {SQLiteObject} from '@ionic-native/sqlite';

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

        this.getDevice(device).then(deviceResult => {

                if (deviceResult.length > 0) {
                    const dbDevice = deviceResult[0];
                    device.id = dbDevice.id;
                    this.update(device);
                    console.log('updated a device');
                } else {
                    const sql = 'INSERT INTO devices(device,device_name, date_found, time_found) VALUES(?,?,?,?)';
                    this.db.executeSql(sql, [device.device, device.device_name, device.date_found, device.time_found]);
                    console.log('created a device');
                }
            }
        );
    }

    createTable() {
        const sql = 'CREATE TABLE IF NOT EXISTS devices(id INTEGER PRIMARY KEY AUTOINCREMENT, device TEXT,device_name TEXT, date_found DATE, time_found TIME )';
        return this.db.executeSql(sql, []);
    }

    delete(device: any) {
        const sql = 'DELETE FROM devices WHERE id=?';
        return this.db.executeSql(sql, [device.id]);
    }

    truncate() {
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

        const sql = 'SELECT * FROM devices WHERE device = ' + '\'' + device.device + '\'';
        return this.db.executeSql(sql, [])
            .then(response => {
                console.log('does existst: ' + JSON.stringify(response));
                const devices = [];
                for (let index = 0; index < response.rows.length; index++) {
                    devices.push(response.rows.item(index));
                }
                return Promise.resolve(devices);
            })
            .catch(error => Promise.reject(error));
    }

    update(device: any) {
        const sql = 'UPDATE devices SET device=?, device_name=?, date_found=?,  time_found=? WHERE id=?';
        return this.db.executeSql(sql, [device.device, device.device_name, device.date_found, device.time_found, device.id]);
    }


}
