import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import 'package:path_provider/path_provider.dart';
import 'package:aguka_mobile/core/network/dio_client.dart';
import 'package:aguka_mobile/features/reports/data/models/report_analytics_model.dart';
import 'package:aguka_mobile/core/error/exceptions.dart';

abstract class ReportsRemoteDataSource {
  Future<ReportAnalyticsModel> getAnalytics(String role);
  Future<String> downloadReport(String role, String type);
}

class ReportsRemoteDataSourceImpl implements ReportsRemoteDataSource {
  final DioClient dioClient;

  ReportsRemoteDataSourceImpl({required this.dioClient});

  /// Maps app role strings to the reports-v2 URL segment and default report type.
  static ({String roleBase, String defaultType}) _roleConfig(String role) {
    switch (role.toLowerCase()) {
      case 'officer':
      case 'extension_officer':
        return (roleBase: 'officer', defaultType: 'monthly-summary');
      case 'cooperative':
      case 'cooperative_manager':
        return (roleBase: 'cooperative', defaultType: 'performance');
      default:
        return (roleBase: 'farmer', defaultType: 'performance');
    }
  }

  @override
  Future<ReportAnalyticsModel> getAnalytics(String role) async {
    final cfg = _roleConfig(role);
    try {
      final response = await dioClient.dio
          .get('/reports-v2/${cfg.roleBase}/${cfg.defaultType}');
      if (response.statusCode == 200) {
        final data = response.data['data'] ?? response.data;
        return ReportAnalyticsModel.fromV2Json(data);
      } else {
        throw ServerException('Failed to fetch analytics');
      }
    } catch (_) {
      if (kDebugMode) {
        return ReportAnalyticsModel.mock();
      }
      rethrow;
    }
  }

  @override
  Future<String> downloadReport(String role, String type) async {
    final cfg = _roleConfig(role);
    final path = '/reports-v2/${cfg.roleBase}/$type.pdf';
    try {
      final response = await dioClient.dio.get<List<int>>(
        path,
        options: Options(responseType: ResponseType.bytes),
      );
      if (response.statusCode != 200 || response.data == null) {
        throw ServerException('Failed to download report');
      }
      final dir = await getApplicationDocumentsDirectory();
      final file = File('${dir.path}/${cfg.roleBase}_$type.pdf');
      await file.writeAsBytes(response.data!, flush: true);
      return file.path;
    } on ServerException {
      rethrow;
    } catch (e) {
      throw ServerException('Failed to download report: $e');
    }
  }
}
