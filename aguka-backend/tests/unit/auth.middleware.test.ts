enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  COOPERATIVE = 'COOPERATIVE',
  OFFICER = 'OFFICER',
  FARMER = 'FARMER',
}

interface MockRequest {
  method: string;
  originalUrl: string;
  path?: string;
  user?: { sub: string; role: UserRole };
}

function inferPermission(req: MockRequest): string | null {
  const path = req.originalUrl.split('?')[0];
  const method = req.method.toUpperCase();

  if (path.includes('/superadmin/backups')) return 'manage_backups';
  if (path.includes('/superadmin/roles')) return 'manage_roles';
  if (path.includes('/superadmin/settings')) return 'manage_settings';
  if (path.includes('/superadmin/audit-logs') || path.includes('/audit')) {
    return 'view_audit_logs';
  }
  if (
    path.includes('/superadmin/users') ||
    (path.includes('/users') &&
      !(method === 'GET' && req.user?.role === UserRole.COOPERATIVE))
  ) {
    return 'manage_users';
  }
  if (path.includes('/admin/notifications')) return 'broadcast_notifications';
  if (path.includes('/admin') || path.includes('/superadmin/reports')) {
    return 'manage_all_data';
  }
  if (path.includes('/officer/advisories')) return 'send_advisories';
  if (path.includes('/farmers/assigned') || path.includes('/officer/farms')) {
    return 'manage_assigned_farmers';
  }
  if (path.includes('/cooperatives') && path.includes('/resources')) {
    return 'manage_resources';
  }
  if (path.includes('/cooperatives') && path.includes('/activities')) {
    return 'schedule_events';
  }
  if (path.includes('/cooperatives') && path.includes('/members')) {
    return 'manage_cooperative_members';
  }
  if (path.match(/^\/reports(\/|$)/) && method !== 'GET') return 'view_reports';

  return null;
}

describe('inferPermission path matching', () => {
  it('should return view_reports for POST /reports/soil', () => {
    const req: MockRequest = { method: 'POST', originalUrl: '/reports/soil', user: { sub: '1', role: UserRole.OFFICER } };
    expect(inferPermission(req)).toBe('view_reports');
  });

  it('should return view_reports for POST /reports', () => {
    const req: MockRequest = { method: 'POST', originalUrl: '/reports', user: { sub: '1', role: UserRole.OFFICER } };
    expect(inferPermission(req)).toBe('view_reports');
  });

  it('should return null for GET /reports (GET excluded)', () => {
    const req: MockRequest = { method: 'GET', originalUrl: '/reports', user: { sub: '1', role: UserRole.OFFICER } };
    expect(inferPermission(req)).toBeNull();
  });

  it('should return null for POST /reports-v2/soil (should NOT match /reports)', () => {
    const req: MockRequest = { method: 'POST', originalUrl: '/reports-v2/soil', user: { sub: '1', role: UserRole.OFFICER } };
    expect(inferPermission(req)).toBeNull();
  });

  it('should return null for POST /reports-v2', () => {
    const req: MockRequest = { method: 'POST', originalUrl: '/reports-v2', user: { sub: '1', role: UserRole.OFFICER } };
    expect(inferPermission(req)).toBeNull();
  });

  it('should return view_reports for PUT /reports/123', () => {
    const req: MockRequest = { method: 'PUT', originalUrl: '/reports/123', user: { sub: '1', role: UserRole.OFFICER } };
    expect(inferPermission(req)).toBe('view_reports');
  });

  it('should return null for unknown paths', () => {
    const req: MockRequest = { method: 'GET', originalUrl: '/api/health', user: { sub: '1', role: UserRole.OFFICER } };
    expect(inferPermission(req)).toBeNull();
  });

  it('should handle paths with query strings', () => {
    const req: MockRequest = { method: 'POST', originalUrl: '/reports/soil?type=full', user: { sub: '1', role: UserRole.OFFICER } };
    expect(inferPermission(req)).toBe('view_reports');
  });
});
