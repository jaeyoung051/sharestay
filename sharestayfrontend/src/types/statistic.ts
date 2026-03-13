export interface Statistic {
  statisticId: number;
  statisticType: string;
  dataType: string;
  value: number;
  recordedAt: string;
}

export interface DistrictSafety {
  district: string;
  safetyScore: number;
  trustScore?: number;
  activityScore?: number;
  crimeRate?: number | string;
  cctvDensity?: number | string;
  trend?: string;
  recordedAt?: string;
}
