import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:aguka_mobile/widgets/soil_trend_chart.dart';
import 'package:aguka_mobile/widgets/aguka_app_bar.dart';
import 'package:aguka_mobile/features/auth/bloc/auth_bloc.dart';
import 'package:aguka_mobile/features/auth/bloc/auth_state.dart';
import 'package:aguka_mobile/features/telemetry/bloc/telemetry_bloc.dart';
import 'package:aguka_mobile/features/telemetry/bloc/telemetry_event.dart';
import 'package:aguka_mobile/features/telemetry/bloc/telemetry_state.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:aguka_mobile/injection_container.dart';

class SoilPage extends StatelessWidget {
  const SoilPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) {
        final bloc = sl<TelemetryBloc>();
        final authState = context.read<AuthBloc>().state;
        if (authState is AuthAuthenticated) {
          bloc.add(FetchLatestTelemetry(authState.user.id));
        }
        return bloc;
      },
      child: const SoilView(),
    );
  }
}

class SoilView extends StatelessWidget {
  const SoilView({Key? key}) : super(key: key);

  void _refreshData(BuildContext context) {
    final authState = context.read<AuthBloc>().state;
    if (authState is AuthAuthenticated) {
      context.read<TelemetryBloc>().add(FetchLatestTelemetry(authState.user.id));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AgukaAppBar(
        title: 'soil.title'.tr(),
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: () => _refreshData(context)),
        ],
      ),
      body: BlocBuilder<TelemetryBloc, TelemetryState>(
        builder: (context, state) {
          if (state.status == TelemetryStatus.initial || state.status == TelemetryStatus.connecting && state.latestData == null) {
            return const Center(child: CircularProgressIndicator());
          }
          
          if (state.status == TelemetryStatus.error && state.latestData == null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, size: 48, color: Colors.red),
                  const SizedBox(height: 16),
                  Text(state.errorMessage ?? 'Error loading data'),
                  ElevatedButton(
                    onPressed: () => _refreshData(context),
                    child: const Text('Retry'),
                  )
                ],
              ),
            );
          }

          final telemetry = state.latestData;
          if (telemetry == null) {
            return const Center(child: Text('No telemetry data available.'));
          }

          // Simulated historical readings since we only have the latest from API for now
          final historicalReadings = [
            {
              'moisture_percent': telemetry.soilMoisture,
              'temp_celsius': telemetry.temperature,
              'reading_at': telemetry.timestamp.toIso8601String(),
            }
          ];

          return RefreshIndicator(
            onRefresh: () async => _refreshData(context),
            child: ListView(
              padding: const EdgeInsets.all(16.0),
              children: [
                _buildMainStatusCard(telemetry.soilMoisture),
                const SizedBox(height: 16),
                _buildNpkGrid(telemetry.npk.n, telemetry.npk.p, telemetry.npk.k),
                const SizedBox(height: 16),
                _buildHistoricalChart(historicalReadings),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildMainStatusCard(double moisture) {
    bool isOptimal = moisture >= 20 && moisture <= 60;
    
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [Colors.green[700]!, Colors.green[500]!],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('soil.moisture'.tr(), style: const TextStyle(color: Colors.white, fontSize: 16)),
                      const SizedBox(height: 4),
                      Text('${moisture.toStringAsFixed(1)}%', style: const TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(color: Colors.white.withAlpha((0.2 * 255).toInt()), borderRadius: BorderRadius.circular(20)),
                  child: Text(
                    isOptimal ? 'soil.status_optimal'.tr() : (moisture < 20 ? 'soil.status_low'.tr() : 'soil.status_high'.tr()),
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: LinearProgressIndicator(
                value: (moisture / 100).clamp(0.0, 1.0),
                backgroundColor: Colors.white.withAlpha((0.2 * 255).toInt()),
                valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
                minHeight: 10,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNpkGrid(double n, double p, double k) {
    return GridView.count(
      crossAxisCount: 3,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 12,
      children: [
        _buildNutrientCard('soil.nitrogen'.tr(), n.toStringAsFixed(1), 'mg/kg', Colors.blue),
        _buildNutrientCard('soil.phosphorus'.tr(), p.toStringAsFixed(1), 'mg/kg', Colors.purple),
        _buildNutrientCard('soil.potassium'.tr(), k.toStringAsFixed(1), 'mg/kg', Colors.orange),
      ],
    );
  }

  Widget _buildNutrientCard(String label, String value, String unit, Color color) {
    return Card(
      elevation: 1,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(label, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: color)),
          const SizedBox(height: 8),
          Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          Text(unit, style: const TextStyle(fontSize: 10, color: Colors.grey)),
        ],
      ),
    );
  }

  Widget _buildHistoricalChart(List<Map<String, dynamic>> historicalReadings) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('soil.trend_7day'.tr(), style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 24),
            SizedBox(
              height: 200,
              width: double.infinity,
              child: SoilTrendChart(readings: historicalReadings),
            ),
          ],
        ),
      ),
    );
  }
}
