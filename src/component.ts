import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Http, Response } from '@angular/http';
import { InfiniteScroll, Refresher } from 'ionic-angular';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

@Component({
  selector: 'yci-paginator',
  template: `<ng-content></ng-content>`
})
export class Paginator implements OnInit {
  items: any[] = [];
  page: number;
  pages: number;
  total: number;
  @Input() params: PaginatorParams;
  @Output() onData: EventEmitter<PaginatorData> = new EventEmitter<PaginatorData>();
  @Output() onClear: EventEmitter<void> = new EventEmitter<void>();
  constructor(
    private http: Http
  ) { }

  ngOnInit() {
    this.page = 1;
    if (this.params.autoLoad)
      this.next();
  }

  async next(infiniteScroll?: InfiniteScroll): Promise<any[]> {
    const data = await this.http.get(this.generateUrl(), {
      headers: this.params.headers
    })
      .map(x => this.params.map(x))
      .toPromise();

    this.pages = data.pages;
    this.total = data.total;
    const items = data.docs;

    this.push(items);
    this.page++;
    this.onData.emit(data);

    if (infiniteScroll) {
      infiniteScroll.complete();
      if (this.page > data.pages) {
        infiniteScroll.enable(false);
      }
    }

    return this.items;
  }

  clear(): void {
    this.page = 1;
    this.items = [];
    this.onClear.emit();
  }

  async refresh(refresher?: Refresher): Promise<void> {
    this.clear();
    await this.next();
    if (refresher)
      refresher.complete();
  }

  private generateUrl() {
    let options: any = {};
    let filters: any = {};
    if (this.params.options) {
      options = Object.assign(options, this.params.options);
    }
    if (this.params.filters) {
      filters = JSON.parse(JSON.stringify(this.params.filters));
    }
    options.page = this.page;
    return `${this.params.url}?_options=${encodeURIComponent(JSON.stringify(options))}&_filters=${encodeURIComponent(JSON.stringify(filters))}`;
  }

  private push(items: Array<any>) {
    let waitings = [];
    for (const item of items) {
      const exist = this.items.findIndex(x => x._id === item._id);
      if (exist === -1)
        waitings.push(item);
      else
        this.items[exist] = item;
    }
    this.items = this.items.concat(waitings);
  }
}

export interface PaginatorData {
  total: number;
  limit: number;
  offset: number;
  page: number;
  pages: number;
  docs: any[];
}

export interface PaginatorParams {
  url: string;
  map: (x: Response) => Promise<PaginatorData>;
  autoLoad?: boolean;
  headers?: any;
  options?: PaginatorParamsOptions;
  filters?: any;
}

export interface PaginatorParamsOptions {
  sort?: any;
  select?: any;
  populate?: PaginatorParamsPopulate | string | Array<PaginatorParamsPopulate>;
  lean?: any;
  leanWithId?: any;
  limit?: number;
}

export interface PaginatorParamsPopulate {
  path: string;
  match?: any;
  select?: string;
  options?: any;
  populate?: PaginatorParamsPopulate | string | Array<PaginatorParamsPopulate>;
}