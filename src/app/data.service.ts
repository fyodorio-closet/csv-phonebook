import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

import { appConfig } from './app.config';
import { Entry } from './entry.model';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  entityData$: BehaviorSubject<any> = new BehaviorSubject<any>([]);

  constructor(private http: HttpClient) { }

  getData() {
    this.http.get(appConfig.apiUrl).subscribe(data => {
      this.entityData$.next(data);
    });
  }

  updateData(payload: Entry[]) {
    this.http.put(appConfig.apiUrl, JSON.stringify(payload), appConfig.httpOptions).subscribe(data => this.entityData$.next(data));
  }
}