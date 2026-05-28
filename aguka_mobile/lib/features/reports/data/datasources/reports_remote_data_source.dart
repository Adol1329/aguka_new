import 'package:aguka_mobile/core/network/dio_client.dart';
import 'package:aguka_mobile/features/reports/data/models/report_analytics_model.dart';
import 'package:aguka_mobile/core/error/exceptions.dart';

abstract class ReportsRemoteDataSource {
  Future<ReportAnalyticsModel> getAnalytics();
  Future<String> downloadReport(String type);
}

class ReportsRemoteDataSourceImpl implements ReportsRemoteDataSource {
  final DioClient dioClient;

  ReportsRemoteDataSourceImpl({required this.dioClient});

  @override
  Future<ReportAnalyticsModel> getAnalytics() async {
    try {
      final response = await dioClient.dio.get('/reports/analytics');
      if (response.statusCode == 200) {
        final data = response.data['data'] ?? response.data;
        return ReportAnalyticsModel.fromJson(data);
      } else {
        throw ServerException('Failed to fetch analytics');
      }
    } catch (_) {
      // Fallback to mock data while endpoint is under development
      return ReportAnalyticsModel.mock();
    }
  }

  @override
  Future<String> downloadReport(String type) async {
    try {
      // In production: trigger a download or return a signed URL
      final response = await dioClient.dio.get('/reports/download/$type');
      if (response.statusCode == 200) {
        return response.data['url'] ?? '/reports/$type';
      }
      return '/reports/$type';
    } catch (_) {
      return '/reports/$type';
    }
  }
}
