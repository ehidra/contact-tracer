import {Injectable} from '@angular/core';
import {FirebaseService} from '../service/firebase.service';
import {DatabaseService} from '../service/database.service';
import {FirebaseAuthentication} from '@ionic-native/firebase-authentication/ngx';
import Keypair from 'keypair';
import {NavController, Platform} from '@ionic/angular';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private verificationId: any;
    private code: number;
    public loggedIn = false;
    public publicKey = '';

    constructor(
        private firebaseAuthentication: FirebaseAuthentication,
        private firebaseService: FirebaseService,
        private databaseService: DatabaseService,
        private navCtrl: NavController
    ) {

    }

    connect() {
        this.firebaseAuthentication.onAuthStateChanged().subscribe((successOnAuthStateChange) => {
                console.log('successOnAuthStateChange: ' + JSON.stringify(successOnAuthStateChange));
                if (successOnAuthStateChange !== '' && successOnAuthStateChange.uid) {

                    this.databaseService.getUUID().then((sqlResult: any) => {
                        if (sqlResult.rows.length === 0) {
                            const pubprivkey = Keypair();
                            const user = {
                                phone_number: successOnAuthStateChange.phoneNumber,
                                join_date: new Date(),
                                secret_key: pubprivkey.private
                            };
                            console.log('adding user' + JSON.stringify(user));
                            this.firebaseService.addUser(user).then((successAddUser) => {
                                console.log('success add user ' + successAddUser.id);
                                this.databaseService.insertUUID(successAddUser.id).then((uuidInserted) => {
                                    this.databaseService.insertPublicKey(pubprivkey.public).then((publicKeyInserted) => {
                                        this.loggedIn = true;
                                        this.publicKey = pubprivkey.public;
                                        this.navCtrl.navigateRoot('/home');
                                    });
                                });
                            }, (errorAddUser) => {
                                console.log('errorAddUser' + JSON.stringify(errorAddUser));
                            });
                        } else {
                            this.databaseService.getPublicKey().then((publicKey) => {
                                this.loggedIn = true;
                                this.publicKey = publicKey;
                                this.navCtrl.navigateRoot('/home');
                            });
                        }
                    }, (error) => {
                        console.log('error getting UUID: ' + JSON.stringify(error));
                    });
                }
            },
            (errorOnAuthStateChange) => {
                console.log('errorOnAuthStateChange: ' + JSON.stringify(errorOnAuthStateChange));
            }
        );
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
