import { Injectable } from '@angular/core';
import { Database, ref, onValue } from '@angular/fire/database';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {

  private bpmSubject = new BehaviorSubject<number>(0);
  bpm$ = this.bpmSubject.asObservable();

  constructor(private db: Database) {}

  iniciarListener() {

    const bpmRef = ref(this.db, 'bpm');

    onValue(bpmRef, (snapshot) => {
      const data = snapshot.val();

      if (data !== null) {
        this.bpmSubject.next(data);
      }
    });

  }

}