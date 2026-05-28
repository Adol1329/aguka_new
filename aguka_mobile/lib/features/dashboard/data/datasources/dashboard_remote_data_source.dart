import 'package:dio/dio.dart';
import 'package:aguka_mobile/core/error/exceptions.dart';
import 'package:aguka_mobile/features/dashboard/data/models/dashboard_summary_model.dart';

abstract class DashboardRemoteDataSource {
  Future<DashboardSummaryModel> getDashboardSummary(String farmId);
}

class DashboardRemoteDataSourceImpl implements DashboardRemoteDataSource {
  final Dio client;

  DashboardRemoteDataSourceImpl(this.client);

  @override
  Future<DashboardSummaryModel> getDashboardSummary(String farmId) async {
    final response = await client.get('/farmers/crops/simulate/$farmId');
    
    if (response.statusCode == 200) {
      return DashboardSummaryModel.fromJson(response.data);
    } else {
      throw ServerException();
    }
  }
}
