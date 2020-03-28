import {Injectable} from '@angular/core';
import {SQLite, SQLiteObject} from '@ionic-native/sqlite/ngx';

@Injectable({
    providedIn: 'root'
})
export class DatabaseService {

    db: SQLiteObject = null;
    ready = false;

    constructor(private sqlite: SQLite) {
    }

    public createDatabase() {
        this.sqlite.create({
            name: 'data.db',
            location: 'default' // the location field is required
        })
            .then((db) => {
                this.setDatabase(db);
            })
            .then(() => {
                // console.log('Data base set up correctly');
            })
            .catch(error => {
                console.error(error);
            });
    }

    // public methods

    setDatabase(db: SQLiteObject) {
        if (this.db === null) {
            this.db = db;
            this.createTable();
        }
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

    create(device: any) {
        const sql = 'INSERT INTO devices(uuid, rssi, date_found, time_found) VALUES(?,?,?,?)';
        this.db.executeSql(sql, [device.uuid, device.rssi, device.date_found, device.time_found]);
        console.log('created a device-time ' + device.uuid + ' ' + device.rssi + ' ' + device.date_found + ' ' + device.time_found);
    }


    delete(device: any) {
        const sql = 'DELETE FROM devices WHERE id=?';
        return this.db.executeSql(sql, [device.id]);
    }

    truncate() {
        const settingSql = 'DELETE FROM settings';
        this.db.executeSql(settingSql, []);
        const sql = 'DELETE FROM devices';
        return this.db.executeSql(sql, []);
    }

    getAll() {
        const sql = 'SELECT * FROM devices ORDER BY date_found, time_found DESC';
        return this.db.executeSql(sql, [])
            .then(response => {
                const devices = [];
                for (let index = 0; index < response.rows.length; index++) {
                    devices.push(response.rows.item(index));
                }
                return Promise.resolve(devices);
            })
            .catch(error => {
                return Promise.reject(error);
            });
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
            .catch((error) => {
                return Promise.reject(error);
            });
    }

    update(device: any) {
        const sql = 'UPDATE devices SET uuid=?, SET rssi=?, date_found=?,  time_found=? WHERE id=?';
        return this.db.executeSql(sql, [device.uuid, device.rssi, device.date_found, device.time_found, device.id]);
    }

    getUUID() {
        const sql = 'SELECT * FROM settings WHERE name = \'uuid\'';
        return this.db.executeSql(sql, []);
    }

    insertUUID(uuid) {
        const uuidSql = 'INSERT INTO settings(name, value) VALUES(?,?)';
        return this.db.executeSql(uuidSql, ['uuid', uuid]);
    }

    insertPublicKey(publicKey) {
        const pkSql = 'INSERT INTO settings(name, value) VALUES(?,?)';
        return this.db.executeSql(pkSql, ['public_key', publicKey]);
    }

    getPublicKey() {
        const sql = 'SELECT * FROM settings WHERE name = \'public_key\'';
        return this.db.executeSql(sql, []);
    }

}
