import { NgModule, ModuleWithProviders, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpModule } from '@angular/http';
import { CommonModule } from '@angular/common';
import { Paginator } from './component';

export * from './component';

@NgModule({
  imports: [
    CommonModule,
    HttpModule
  ],
  declarations: [
    Paginator
  ],
  exports: [
    Paginator
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class PaginatorModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: PaginatorModule,
      providers: []
    };
  }
}
