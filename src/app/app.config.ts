import { HttpHeaders } from '@angular/common/http';

export const appConfig = {
  apiUrl: 'https://api.myjson.com/bins/1ad077',
  httpOptions: {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'
    })
  }
}