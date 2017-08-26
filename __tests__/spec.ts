import { async, fakeAsync, tick, inject, ComponentFixture, TestBed } from '@angular/core/testing';
import { BaseRequestOptions, Http, HttpModule, Response, ResponseOptions, ResponseType } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { InfiniteScroll, Refresher } from 'ionic-angular';

import { Paginator, PaginatorModule, PaginatorData } from '../src/';

function generateData(qs): PaginatorData {
  let docs = Array(30).fill(1).map((x, y) => x + y)
    .map(x => {
      return {
        _id: x,
        name: 'item-' + x
      }
    });
  for(let filter of Object.keys(qs._filters)) {
    docs = docs.filter(x => x[filter] === qs._filters[filter]);
  }
  const limit = qs._options.limit || 10;
  const data: PaginatorData = {
    total: docs.length,
    page: qs._options.page,
    pages: Math.ceil(docs.length / limit),
    limit: limit,
    offset: qs._options.page - 1,
    docs: docs.slice((qs._options.page - 1) * limit, qs._options.page * limit)
  };
  return data;
}

describe('Paginator', () => {
  let comp: Paginator;
  let fixture: ComponentFixture<Paginator>;
  let mb: MockBackend;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockBackend,
        BaseRequestOptions,
        {
          provide: Http,
          useFactory: (backend, options) => new Http(backend, options),
          deps: [MockBackend, BaseRequestOptions]
        }
      ],
      imports: [
        HttpModule,
        PaginatorModule.forRoot()
      ]
    });

    fixture = TestBed.createComponent(Paginator);

    comp = fixture.componentInstance; // BannerComponent test instance
  });

  beforeEach(inject([MockBackend], (_mb) => {
    mb = _mb;
    const mbSub = mb.connections.subscribe(conn => {
      const url = conn.request.url;
      const pairs = url.substring('http://mock?'.length);
      const qs = pairs.split('&').map(x => x.split('='))
        .reduce((a, b) => {
          a[b[0]] = JSON.parse(b[1]);
          return a;
        }, {});

      conn.mockRespond(new Response(new ResponseOptions({
        body: generateData(qs)
      })));
    });
  }));

  it('should be defined', () => {
    expect(comp).toBeDefined();
  });

  it('should load data', fakeAsync(() => {
    comp.params = {
      url: 'http://mock',
      map: x => x.json()
    }
    comp.ngOnInit();
    comp.next();
    tick();
    expect(comp.items.length).toBe(10);
    comp.next();
    tick();
    expect(comp.items.length).toBe(20);
  }));

  it('should load data automatically', fakeAsync(() => {
    comp.params = {
      url: 'http://mock',
      map: x => x.json(),
      autoLoad: true
    }
    comp.ngOnInit();
    tick();
    expect(comp.items.length).toBe(10);
  }));

  it('should load data with options', fakeAsync(() => {
    comp.params = {
      url: 'http://mock',
      map: x => x.json(),
      options: {
        limit: 5
      }
    }
    comp.ngOnInit();
    comp.next();
    tick();
    expect(comp.items.length).toBe(5);
  }));

  it('should load data with filters', fakeAsync(() => {
    comp.params = {
      url: 'http://mock',
      map: x => x.json(),
      filters: {
        _id: 1
      }
    }
    comp.ngOnInit();
    comp.next();
    tick();
    expect(comp.items.length).toBe(1);
  }));

  it('should overwrite exits data', fakeAsync(() => {
    comp.params = {
      url: 'http://mock',
      map: x => x.json()
    }
    comp.ngOnInit();
    comp.items.push({ _id: 1 });
    comp.next();
    tick();
    expect(comp.items.length).toBe(10);
  }));

  it('should load data with infinite scroll', fakeAsync(() => {
    let complete: boolean;
    let enabled: boolean = true;
    const infiniteScroll: InfiniteScroll = <any>{
      enable: (x) => enabled = x,
      complete: () => complete = true
    };
    comp.params = {
      url: 'http://mock',
      map: x => x.json()
    };
    comp.ngOnInit();

    complete = false;
    comp.next(infiniteScroll);
    tick();
    expect(comp.items.length).toBe(10);
    expect(complete).toBe(true);
    expect(enabled).toBe(true);
    
    complete = false;
    comp.next(infiniteScroll);
    tick();
    expect(comp.items.length).toBe(20);
    expect(complete).toBe(true);
    expect(enabled).toBe(true);
    
    complete = false;
    comp.next(infiniteScroll);
    tick();
    expect(comp.items.length).toBe(30);
    expect(complete).toBe(true);
    expect(enabled).toBe(false);
  }));


  it('should refresh data', fakeAsync(() => {
    let complete: boolean;
    const refresher: Refresher = <any>{
      complete: () => complete = true
    }
    comp.params = {
      url: 'http://mock',
      map: x => x.json()
    }
    comp.ngOnInit();
    comp.next();
    tick();
    comp.next();
    tick();
    expect(comp.items.length).toBe(20);
    comp.refresh();
    tick();
    expect(comp.items.length).toBe(10);
    comp.refresh(refresher);
    tick();
    expect(comp.items.length).toBe(10);
    expect(complete).toBe(true);
  }));
});
