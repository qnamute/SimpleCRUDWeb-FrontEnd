import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, pipe } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Tree } from '../models/tree';
import { FoodNode } from '../interfaces/FoodNode';

@Injectable({
  providedIn: 'root'
})
export class TreesService {

  myAppUrl: string;
  myApiUrl: string;

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8'
    })
  };

  constructor(private http: HttpClient) {
    this.myAppUrl = environment.appUrl;
    this.myApiUrl = 'api/trees/';
  }

  getTrees(): Observable<Tree[]> {
    return this.http.get<Tree[]>(this.myAppUrl + this.myApiUrl)
      .pipe(
        retry(1),
        catchError(this.errorHandler)
      );
  }

  getTreesStructure(): Observable<Tree[]> {
    return this.http.get<Tree[]>(this.myAppUrl + this.myApiUrl + 'GetTreesStructure')
      .pipe(
        retry(1),
        catchError(this.errorHandler)
      );
  }

  getTree(threeId: number): Observable<Tree> {
    return this.http.get<Tree>(this.myAppUrl + this.myApiUrl + threeId)
      .pipe(
        retry(1),
        catchError(this.errorHandler)
      );
  }

  saveTree(tree): Observable<Tree> {
    return this.http.post<Tree>(this.myAppUrl + this.myApiUrl, JSON.stringify(tree), this.httpOptions)
      .pipe(
        retry(1),
        catchError(this.errorHandler)
      );
  }

  updateTree(treeId: number, tree: Tree): Observable<Tree> {
    return this.http.put<Tree>(this.myAppUrl + this.myApiUrl + treeId, JSON.stringify(tree), this.httpOptions)
      .pipe(
        retry(1),
        catchError(this.errorHandler)
      );
  }

  updateItem(node: FoodNode, name: string) {
    return this.http.put<Tree>(this.myAppUrl + this.myApiUrl + node.treeId, JSON.stringify(node), this.httpOptions)
      .pipe(
        retry(1),
        catchError(this.errorHandler)
      );
  }

  deleteTree(treeId: number): Observable<Tree> {
    return this.http.delete<Tree>(this.myAppUrl + this.myApiUrl + treeId)
      .pipe(
        retry(1),
        catchError(this.errorHandler)
      );
  }

  getRootLevelNodes(): Observable<Tree[]> {
    const url = 'GetRootLevelNodes';
    return this.http.get<Tree[]>(this.myAppUrl + this.myApiUrl + url)
      .pipe(
        retry(1),
        catchError(this.errorHandler)
      );
  }

  errorHandler(error) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.log(errorMessage);
    return throwError(errorMessage);
  }
}
