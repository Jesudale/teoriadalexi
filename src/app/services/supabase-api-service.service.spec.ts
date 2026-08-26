import { TestBed } from '@angular/core/testing';

import { SupabaseApiServiceService } from './supabase-api-service.service';

describe('SupabaseApiServiceService', () => {
  let service: SupabaseApiServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SupabaseApiServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
