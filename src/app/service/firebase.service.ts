import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {


  public token = null;
  private usersCollection: AngularFirestoreCollection;

  constructor(private afs: AngularFirestore) {
    this.usersCollection = this.afs.collection('users');
  }
  addUser(user) {
    return this.usersCollection.add(user);
  }

  updateUser(user) {
    return this.usersCollection.doc(user.id).update({secret_key: user.secret_key});
  }

  deleteUser(id: string) {
    return this.usersCollection.doc(id).delete();
  }

}
