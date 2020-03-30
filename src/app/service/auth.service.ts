import {Injectable} from '@angular/core';
import {FirebaseService} from '../service/firebase.service';
import {DatabaseService} from '../service/database.service';
import {FirebaseAuthentication} from '@ionic-native/firebase-authentication/ngx';
import * as forge from 'node-forge';
import {NavController, Platform} from '@ionic/angular';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private verificationId: any;
    private code: number;
    public loggedIn = false;
    public uuid = '';
    public publicKey = '';

    constructor(
        private firebaseAuthentication: FirebaseAuthentication,
        private firebaseService: FirebaseService,
        private databaseService: DatabaseService,
        private navCtrl: NavController
    ) {
    }

    async connect() {

        this.firebaseAuthentication.onAuthStateChanged().subscribe(async (successOnAuthStateChange) => {
                console.log('successOnAuthStateChange: ' + JSON.stringify(successOnAuthStateChange));
                if (successOnAuthStateChange !== '' && successOnAuthStateChange.uid) {

                    const getUUIDResult = await this.databaseService.getUUID();
                    if (getUUIDResult.rows.length === 0) {
                        const rsa = forge.pki.rsa;

                        rsa.generateKeyPair({bits: 2048, workers: 2}, async (err, keypair) => {
                            const privateKey = forge.pki.privateKeyToPem(keypair.privateKey);
                            const publicKey = forge.pki.publicKeyToPem(keypair.publicKey);
                            console.log('private' + JSON.stringify(privateKey));
                            console.log('public' + JSON.stringify(publicKey));
                            const user = {
                                phone_number: successOnAuthStateChange.uid,
                                join_date: new Date(),
                                secret_key: privateKey
                            };
                            console.log('adding user' + JSON.stringify(user));

                            const firebaseUser = await this.firebaseService.addUser(user);
                            console.log('success add user ' + firebaseUser.id);
                            const insertUUID = await this.databaseService.insertUUID(firebaseUser.id);
                            console.log('insertUUID: ' + JSON.stringify(insertUUID));
                            const insertPublicKey = await this.databaseService.insertPublicKey(publicKey);
                            console.log('insertPublicKey: ' + JSON.stringify(insertPublicKey));
                            this.loggedIn = true;
                            this.uuid = firebaseUser.id;
                            this.publicKey = publicKey;
                            this.navCtrl.navigateRoot('/scan');

                        });
                    } else {
                        this.loggedIn = true;
                        const getPublicKeyResult = await this.databaseService.getPublicKey();
                        this.uuid = getUUIDResult.rows.item(0).value;
                        this.publicKey = getPublicKeyResult.rows.item(0).value;
                        this.navCtrl.navigateRoot('/scan');
                    }

                }
            },
            (errorOnAuthStateChange) => {
                console.log('errorOnAuthStateChange: ' + JSON.stringify(errorOnAuthStateChange));
            }
        );

        let getIdTokenResult = null;
        try {
            getIdTokenResult = await this.firebaseAuthentication.getIdToken(true);
            console.log('getIdTokenResult: ' + JSON.stringify(getIdTokenResult));
        } catch (e) {
            // not connected to firebase
            console.log('getIdTokenResult: ' + e);
            this.navCtrl.navigateRoot('/signup');
        }

    }

    signUp(phone) {
        console.log('signing up');
        this.firebaseAuthentication.verifyPhoneNumber(phone, 3000).then((successVerifyPhoneNumber: any) => {
            console.log('successVerifyPhoneNumber: ' + JSON.stringify(successVerifyPhoneNumber));
            this.verificationId = successVerifyPhoneNumber.verificationId;
        }).catch((errorVerifyPhoneNumber: any) => {
            console.log('errorVerifyPhoneNumber: ' + JSON.stringify(errorVerifyPhoneNumber));
        });
    }

    verify() {
        const sigInCredential = this.firebaseAuthentication.signInWithVerificationId(this.verificationId, this.code).then((successSignInWithVerificationId) => {
            console.log('successSignInWithVerificationId: ' + JSON.stringify(successSignInWithVerificationId));
        }, (errorSignInWithVerificationId) => {
            console.log('errorSignInWithVerificationId: ' + JSON.stringify(errorSignInWithVerificationId));
        });
    }

    logOut() {
        this.firebaseAuthentication.signOut().then((successSignOut) => {
            console.log('successSignOut: ' + JSON.stringify(successSignOut));
        }, (errorSignOut) => {
            console.log('errorSignOut: ' + JSON.stringify(errorSignOut));
        });
    }

    getUser() {
        console.log('getting user');
        this.firebaseAuthentication.getIdToken(false).then((successGetIdToken: any) => {
            console.log('successGetIdToken: ' + JSON.stringify(successGetIdToken));

        }).catch((errorGetIdToken: any) => {
            console.log('errorGetIdToken: ' + JSON.stringify(errorGetIdToken));
        });
    }
}
