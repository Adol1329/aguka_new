import 'package:dio/dio.dart';
import 'package:aguka_mobile/core/error/exceptions.dart';
import 'package:aguka_mobile/features/dashboard/data/models/dashboard_summary_model.dart';
import 'package:aguka_mobile/features/dashboard/data/models/officer_dashboard_model.dart';
import 'package:aguka_mobile/features/dashboard/data/models/cooperative_dashboard_model.dart';
import 'package:aguka_mobile/features/dashboard/data/models/farmer_dashboard_model.dart';

abstract class DashboardRemoteDataSource {
  Future<DashboardSummaryModel> getDashboardSummary(String farmId);
  Future<OfficerDashboardModel> getOfficerDashboard();
  Future<CooperativeDashboardModel> getCooperativeDashboard(String cooperativeId);
  Future<FarmerDashboardModel> getFarmerDashboard();
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

  @override
  Future<OfficerDashboardModel> getOfficerDashboard() async {
    final response = await client.get('/officer/dashboard');

    if (response.statusCode == 200) {
      return OfficerDashboardModel.fromJson(response.data);
    } else {
      throw ServerException('Failed to load officer dashboard');
    }
  }

  @override
  Future<CooperativeDashboardModel> getCooperativeDashboard(String cooperativeId) async {
    final response = await client.get('/cooperatives/$cooperativeId/dashboard');

    if (response.statusCode == 200) {
      return CooperativeDashboardModel.fromJson(response.data);
    } else {
      throw ServerException('Failed to load cooperative dashboard');
    }
  }

  @override
  Future<FarmerDashboardModel> getFarmerDashboard() async {
    final response = await client.get('/farmers/overview');

    if (response.statusCode == 200) {
      return FarmerDashboardModel.fromJson(response.data);
    } else {
      throw ServerException('Failed to load farmer dashboard');
    }
  }
}
