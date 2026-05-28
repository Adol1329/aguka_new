import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class FilterModel {
  String? crop;
  int? provinceCode;
  int? districtCode;
  DateTimeRange? dateRange;
  double? minMoisture;
  double? maxMoisture;
  double? minTemp;
  double? maxTemp;
  bool? hasRain;

  FilterModel({
    this.crop,
    this.provinceCode,
    this.districtCode,
    this.dateRange,
    this.minMoisture,
    this.maxMoisture,
    this.minTemp,
    this.maxTemp,
    this.hasRain,
  });

  FilterModel copyWith({
    String? crop,
    int? provinceCode,
    int? districtCode,
    DateTimeRange? dateRange,
    double? minMoisture,
    double? maxMoisture,
    double? minTemp,
    double? maxTemp,
    bool? hasRain,
    bool clearProvince = false,
    bool clearDistrict = false,
    bool clearCrop = false,
    bool clearDate = false,
    bool clearMoisture = false,
    bool clearTemp = false,
    bool clearRain = false,
  }) {
    return FilterModel(
      crop: clearCrop ? null : crop ?? this.crop,
      provinceCode: clearProvince ? null : provinceCode ?? this.provinceCode,
      districtCode: clearDistrict ? null : districtCode ?? this.districtCode,
      dateRange: clearDate ? null : dateRange ?? this.dateRange,
      minMoisture: clearMoisture ? null : minMoisture ?? this.minMoisture,
      maxMoisture: clearMoisture ? null : maxMoisture ?? this.maxMoisture,
      minTemp: clearTemp ? null : minTemp ?? this.minTemp,
      maxTemp: clearTemp ? null : maxTemp ?? this.maxTemp,
      hasRain: clearRain ? null : hasRain ?? this.hasRain,
    );
  }

  Map<String, dynamic> toJson() {
    final DateFormat formatter = DateFormat('yyyy-MM-dd');
    return {
      if (crop != null) 'crop': crop,
      if (provinceCode != null) 'provinceCode': provinceCode,
      if (districtCode != null) 'districtCode': districtCode,
      if (dateRange != null) ...{
        'dateFrom': formatter.format(dateRange!.start),
        'dateTo': formatter.format(dateRange!.end),
      },
      if (minMoisture != null) 'minMoisture': minMoisture,
      if (maxMoisture != null) 'maxMoisture': maxMoisture,
      if (minTemp != null) 'minTemp': minTemp,
      if (maxTemp != null) 'maxTemp': maxTemp,
      if (hasRain != null) 'hasRain': hasRain,
    };
  }

  bool get isEmpty {
    return crop == null &&
        provinceCode == null &&
        districtCode == null &&
        dateRange == null &&
        minMoisture == null &&
        maxMoisture == null &&
        minTemp == null &&
        maxTemp == null &&
        hasRain == null;
  }
}
