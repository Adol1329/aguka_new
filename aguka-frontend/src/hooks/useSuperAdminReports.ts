import { useState } from "react";
import { superAdminApi } from "../api/superadmin";

export function useAuditReport() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await superAdminApi.getAuditReportData();
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: string) => {
    await superAdminApi.exportAuditReport(format);
  };

  return { data, loading, fetch, exportReport };
}

export function useHealthReport() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await superAdminApi.getHealthReportData();
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: string) => {
    await superAdminApi.exportHealthReport(format);
  };

  return { data, loading, fetch, exportReport };
}

export function useBackupReport() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await superAdminApi.getBackupReportData();
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: string) => {
    await superAdminApi.exportBackupReport(format);
  };

  return { data, loading, fetch, exportReport };
}

export function useSecurityReport() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await superAdminApi.getSecurityReportData();
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: string) => {
    await superAdminApi.exportSecurityReport(format);
  };

  return { data, loading, fetch, exportReport };
}

export function useNationalReport() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await superAdminApi.getNationalReportData();
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: string) => {
    await superAdminApi.exportNationalReport(format);
  };

  return { data, loading, fetch, exportReport };
}
