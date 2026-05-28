import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:aguka_mobile/widgets/aguka_app_bar.dart';
import 'package:aguka_mobile/features/reports/bloc/reports_cubit.dart';
import 'package:aguka_mobile/features/reports/bloc/reports_event.dart';
import 'package:aguka_mobile/features/reports/bloc/reports_state.dart';
import 'package:aguka_mobile/features/reports/domain/entities/report_entity.dart';
import 'package:aguka_mobile/injection_container.dart';
import 'package:fl_chart/fl_chart.dart';

class ReportsPage extends StatelessWidget {
  const ReportsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => sl<ReportsBloc>()..add(FetchReportAnalytics()),
      child: Scaffold(
        appBar: const AgukaAppBar(title: 'Agronomic Analytics'),
        body: BlocBuilder<ReportsBloc, ReportsState>(
          builder: (context, state) {
            if (state.status == ReportsStatus.loading ||
                state.status == ReportsStatus.initial) {
              return const Center(child: CircularProgressIndicator());
            } else if (state.status == ReportsStatus.loaded &&
                state.analytics != null) {
              return _buildAnalyticsContent(context, state.analytics!);
            } else if (state.status == ReportsStatus.error) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.error_outline, size: 48, color: Colors.red),
                    const SizedBox(height: 16),
                    Text('Error: ${state.errorMessage}'),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () =>
                          context.read<ReportsBloc>().add(FetchReportAnalytics()),
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
    );
  }

  Widget _buildAnalyticsContent(
      BuildContext context, ReportAnalyticsEntity analytics) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _buildPerformanceScore(analytics.overview),
        const SizedBox(height: 24),
        _buildMoistureTrend(analytics.trends),
        const SizedBox(height: 24),
        _buildRecommendations(analytics.recommendations),
        const SizedBox(height: 24),
        _buildQuickDownloads(context),
      ],
    );
  }

  Widget _buildPerformanceScore(ReportOverviewEntity overview) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          gradient: LinearGradient(
            colors: [Colors.green.shade800, Colors.green.shade600],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: Column(
          children: [
            const Text('Season Performance Score',
                style: TextStyle(color: Colors.white70, fontSize: 14)),
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
                _buildScoreMetric('Stability', '${overview.moistureStability}%'),
                _buildScoreMetric('Compliance', '${overview.irrigationCompliance}%'),
                _buildScoreMetric('Avg. Soil', '${overview.avgMoisture.toStringAsFixed(1)}%'),
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
        Text(label, style: const TextStyle(color: Colors.white60, fontSize: 12)),
      ],
    );
  }

  Widget _buildMoistureTrend(ReportTrendsEntity trends) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Soil Moisture Trend',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
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
                  Expanded(child: Text(rec)),
                ],
              ),
            )),
      ],
    );
  }

  Widget _buildQuickDownloads(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Official Reports',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        _buildDownloadTile(
            Icons.picture_as_pdf, 'Soil Analysis Report', 'PDF • 1.2 MB'),
        _buildDownloadTile(
            Icons.picture_as_pdf, 'Seasonal Performance', 'PDF • 2.4 MB'),
      ],
    );
  }

  Widget _buildDownloadTile(IconData icon, String title, String subtitle) {
    return ListTile(
      leading: CircleAvatar(
          backgroundColor: Colors.red.shade50,
          child: Icon(icon, color: Colors.red)),
      title: Text(title),
      subtitle: Text(subtitle),
      trailing: const Icon(Icons.download),
      onTap: () {
        // Handle PDF download via DownloadReport event
      },
    );
  }
}
