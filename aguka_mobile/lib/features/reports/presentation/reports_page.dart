import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:open_file/open_file.dart';
import 'package:aguka_mobile/widgets/aguka_app_bar.dart';
import 'package:aguka_mobile/features/auth/bloc/auth_bloc.dart';
import 'package:aguka_mobile/features/auth/bloc/auth_state.dart';
import 'package:aguka_mobile/features/reports/bloc/reports_cubit.dart';
import 'package:aguka_mobile/features/reports/bloc/reports_state.dart';
import 'package:aguka_mobile/features/reports/domain/entities/report_entity.dart';
import 'package:aguka_mobile/injection_container.dart';
import 'package:fl_chart/fl_chart.dart';

/// Report types available per role (label → type slug).
const _farmerReports = [
  ('Farm Performance Report', 'performance'),
  ('Soil & Irrigation Analysis', 'soil-irrigation'),
  ('Seasonal Report', 'seasonal'),
  ('Yield & Productivity Report', 'yield-productivity'),
];

const _officerReports = [
  ('Monthly Monitoring Summary', 'monthly-summary'),
  ('Assigned Farmers Report', 'assigned-farmers'),
  ('Risk & Advisory Report', 'risk'),
  ('Performance Comparison', 'performance-comparison'),
];

const _cooperativeReports = [
  ('Cooperative Performance Report', 'performance'),
  ('Farmer Comparison Report', 'farmer-comparison'),
  ('Resource Distribution Report', 'resource-distribution'),
  ('Production Report', 'production'),
];

List<(String, String)> _reportsForRole(String role) {
  switch (role.toLowerCase()) {
    case 'officer':
    case 'extension_officer':
      return _officerReports;
    case 'cooperative':
    case 'cooperative_manager':
      return _cooperativeReports;
    default:
      return _farmerReports;
  }
}

class ReportsPage extends StatelessWidget {
  const ReportsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final authState = context.read<AuthBloc>().state;
    final role = authState is AuthAuthenticated ? authState.user.role : 'farmer';

    return BlocProvider(
      create: (context) => sl<ReportsCubit>()..fetchAnalytics(role),
      child: BlocListener<ReportsCubit, ReportsState>(
        listenWhen: (prev, curr) =>
            (curr.downloadUrl != null && curr.downloadUrl != prev.downloadUrl) ||
            (curr.downloadError != null && curr.downloadError != prev.downloadError),
        listener: (context, state) async {
          if (state.downloadError != null) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Download failed: ${state.downloadError}'),
                duration: const Duration(seconds: 4),
              ),
            );
            return;
          }
          final result = await OpenFile.open(state.downloadUrl!);
          if (!context.mounted) return;
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(result.type == ResultType.done
                  ? 'Report downloaded.'
                  : 'Downloaded, but could not open the file: ${result.message}'),
              duration: const Duration(seconds: 3),
            ),
          );
        },
        child: Scaffold(
          appBar: const AgukaAppBar(title: 'Agronomic Analytics'),
          body: BlocBuilder<ReportsCubit, ReportsState>(
            builder: (context, state) {
              if (state.status == ReportsStatus.loading ||
                  state.status == ReportsStatus.initial) {
                return const Center(child: CircularProgressIndicator());
              } else if (state.status == ReportsStatus.loaded &&
                  state.analytics != null) {
                return _buildAnalyticsContent(context, state.analytics!, role);
              } else if (state.status == ReportsStatus.error) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline,
                          size: 48, color: Colors.red),
                      const SizedBox(height: 16),
                      Text('Error: ${state.errorMessage}'),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: () =>
                            context.read<ReportsCubit>().fetchAnalytics(role),
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                );
              }
              return const SizedBox.shrink();
            },
          ),
        ),
      ),
    );
  }

  bool _isCooperative(String role) =>
      role == 'cooperative' || role == 'cooperative_manager';

  Widget _buildAnalyticsContent(
      BuildContext context, ReportAnalyticsEntity analytics, String role) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _buildPerformanceScore(analytics.overview, role),
        if (analytics.executiveSummary.isNotEmpty) ...[
          const SizedBox(height: 24),
          _buildExecutiveSummary(analytics.executiveSummary),
        ],
        const SizedBox(height: 24),
        _buildMoistureTrend(analytics.trends, role),
        const SizedBox(height: 24),
        _buildRecommendations(analytics.recommendations),
        const SizedBox(height: 24),
        _buildQuickDownloads(context, role),
      ],
    );
  }

  Widget _buildPerformanceScore(ReportOverviewEntity overview, String role) {
    final isCoop = _isCooperative(role);
    final scoreLabel = isCoop ? 'Network Performance Score' : 'Season Performance Score';
    final metric1Label = isCoop ? 'Moisture Avg' : 'Stability';
    final metric1Value = isCoop
        ? '${overview.avgMoisture.toStringAsFixed(1)}%'
        : '${overview.moistureStability}%';
    final metric2Label = isCoop ? 'Compliance' : 'Compliance';
    final metric2Value = '${overview.irrigationCompliance}%';
    final metric3Label = isCoop ? 'Stability' : 'Avg. Soil';
    final metric3Value = isCoop
        ? '${overview.moistureStability}%'
        : '${overview.avgMoisture.toStringAsFixed(1)}%';

    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          gradient: LinearGradient(
            colors: isCoop
                ? [Colors.teal.shade800, Colors.teal.shade600]
                : [Colors.green.shade800, Colors.green.shade600],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: Column(
          children: [
            Text(scoreLabel,
                style: const TextStyle(color: Colors.white70, fontSize: 14)),
            const SizedBox(height: 8),
            Text('${overview.score}/100',
                style: const TextStyle(
                    color: Colors.white,
                    fontSize: 48,
                    fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildScoreMetric(metric1Label, metric1Value),
                _buildScoreMetric(metric2Label, metric2Value),
                _buildScoreMetric(metric3Label, metric3Value),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildScoreMetric(String label, String value) {
    return Column(
      children: [
        Text(value,
            style: const TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold)),
        Text(label,
            style: const TextStyle(color: Colors.white60, fontSize: 12)),
      ],
    );
  }

  Widget _buildExecutiveSummary(String summary) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Executive Summary',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text(summary,
              style: TextStyle(
                  fontSize: 13, color: Colors.grey[800], height: 1.5)),
        ],
      ),
    );
  }

  Widget _buildMoistureTrend(ReportTrendsEntity trends, String role) {
    final chartTitle = _isCooperative(role)
        ? 'Network Avg. Moisture Trend'
        : 'Soil Moisture Trend';
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(chartTitle,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        SizedBox(
          height: 200,
          child: LineChart(
            LineChartData(
              gridData: const FlGridData(show: false),
              titlesData: const FlTitlesData(show: false),
              borderData: FlBorderData(show: false),
              lineBarsData: [
                LineChartBarData(
                  spots: trends.soilMoisture.asMap().entries.map((e) {
                    return FlSpot(e.key.toDouble(), e.value.value);
                  }).toList(),
                  isCurved: true,
                  color: Colors.blue,
                  barWidth: 4,
                  dotData: const FlDotData(show: false),
                  belowBarData: BarAreaData(
                      show: true,
                      color: Colors.blue.withValues(alpha: 0.1)),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildRecommendations(List<String> recommendations) {
    if (recommendations.isEmpty) return const SizedBox.shrink();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('AI Recommendations',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        ...recommendations.map((rec) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.lightbulb_outline,
                      color: Colors.orange, size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                      child: Text(rec,
                          style: const TextStyle(fontSize: 13))),
                ],
              ),
            )),
      ],
    );
  }

  Widget _buildQuickDownloads(BuildContext context, String role) {
    final reports = _reportsForRole(role);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Official Reports',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        ...reports.map((r) => _buildDownloadTile(context, r.$1, r.$2, role)),
      ],
    );
  }

  Widget _buildDownloadTile(
      BuildContext context, String title, String reportType, String role) {
    return ListTile(
      leading: CircleAvatar(
          backgroundColor: Colors.red.shade50,
          child: Icon(Icons.picture_as_pdf, color: Colors.red)),
      title: Text(title, style: const TextStyle(fontSize: 14)),
      subtitle: const Text('PDF Report', style: TextStyle(fontSize: 12)),
      trailing: const Icon(Icons.download),
      onTap: () {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Generating $title...'),
            duration: const Duration(seconds: 2),
          ),
        );
        context.read<ReportsCubit>().downloadReport(role, reportType);
      },
    );
  }
}
