[![Build Status](https://travis-ci.org/yc-ionic/paginator.svg?branch=master)](https://travis-ci.org/yc-ionic/paginator.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/yc-ionic/paginator/badge.svg?branch=master)](https://coveralls.io/github/yc-ionic/paginator?branch=master)
[![MIT license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)

# @yci/paginator

## Installation

1. Install the Ionic plugin
```
 npm i -S @yci/paginator
```

2. Add it to your app’s NgModule.

```typescript
// Import your library
import { PaginatorModule } from '@yci/paginator';

@NgModule({

  ...

  imports: [

    ...

    // Specify your library as an import
    PaginatorModule.forRoot()
  ],
  
  ...

})
export class AppModule { }
```

## Usage
Once your library is imported, you can use its component in your Angular application:


```ts
import { PaginatorParams } from '@yci/paginator'

@Component({
  ...
})
export class XXXPage {
  params: PaginatorParams = {
    autoLoad: true,
    url: 'xxx',
    map: x => x.json()
  }
}
```
```xml
<yci-paginator #paginator [params]="params">
  <ion-list>
    <ion-list-header>{{ paginator.total }} records in {{ paginator.pages }} pages</ion-list-header>
    <ion-item *ngFor="let item of paginator.items">
      <ion-icon name="ionic" item-left></ion-icon>
      {{ item.name }}
    </ion-item>
  </ion-list>
</yci-paginator>
```

## Working with ionic refresher and infinite scroll
```xml

  <ion-refresher (ionRefresh)="paginator.refresh($event)">
    <ion-refresher-content pullingText="pull to refresh">
    </ion-refresher-content>
  </ion-refresher>

  <yci-paginator #paginator [params]="params">
    <ion-list>
      <ion-list-header>{{ paginator.total }} records in {{ paginator.pages }} pages</ion-list-header>
      <ion-item *ngFor="let item of paginator.items">
        <ion-icon name="ionic" item-left></ion-icon>
        {{ item.name }}
      </ion-item>
    </ion-list>
  </yci-paginator>

  <ion-infinite-scroll *ngIf="paginator.items.length" (ionInfinite)="paginator.next($event)">
    <ion-infinite-scroll-content></ion-infinite-scroll-content>
  </ion-infinite-scroll>
```

## Instance methods and properties
```ts
items: any[];
page: number;
pages: number;
total: number;
@Input() params: PaginatorParams;
@Output() onData: EventEmitter<PaginatorData>;
@Output() onClear: EventEmitter<void>;

next(infiniteScroll?: InfiniteScroll): Promise<any[]>;
clear(): void;
refresh(refresher?: Refresher): Promise<void>;

```

## Interfaces
```ts
interface PaginatorData {
  total: number;
  limit: number;
  offset: number;
  page: number;
  pages: number;
  docs: any[];
}

interface PaginatorParams {
  url: string;
  map: (x: Response) => Promise<PaginatorData>;
  autoLoad?: boolean;
  headers?: any;
  options?: PaginatorParamsOptions;
  filters?: any;
}

interface PaginatorParamsOptions {
  sort?: any;
  select?: any;
  populate?: PaginatorParamsPopulate | string | Array<PaginatorParamsPopulate>;
  lean?: any;
  leanWithId?: any;
  limit?: number;
}

interface PaginatorParamsPopulate {
  path: string;
  match?: any;
  select?: string;
  options?: any;
  populate?: PaginatorParamsPopulate | string | Array<PaginatorParamsPopulate>;
}
```

## Development

To generate all `*.js`, `*.d.ts` and `*.metadata.json` files:

```bash
$ npm run build
```

## License

MIT © [Yu Chen](mailto:yu.chen@live.ie)
