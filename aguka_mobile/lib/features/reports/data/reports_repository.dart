import 'package:dio/dio.dart';
import 'models/report_analytics.dart';

class ReportsRepository {
  final Dio _dio;

  ReportsRepository(this._dio);

  Future<ReportAnalytics> getAnalytics() async {
    try {
      final response = await _dio.get('/reports/analytics');
      return ReportAnalytics.fromJson(response.data['data']);
    } catch (e) {
      rethrow;
    }
  }

  Future<String> downloadReport(String type) async {
    try {
      // Logic for downloading/opening PDF would go here
      // For now, return the path/url or handle via platform channel
      return '/reports/$type'; 
    } catch (e) {
      rethrow;
    }
  }
}
