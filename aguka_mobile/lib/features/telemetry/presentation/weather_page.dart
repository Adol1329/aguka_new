import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:aguka_mobile/features/auth/bloc/auth_bloc.dart';
import 'package:aguka_mobile/features/auth/bloc/auth_state.dart';
import 'package:aguka_mobile/features/telemetry/bloc/telemetry_bloc.dart';
import 'package:aguka_mobile/features/telemetry/bloc/telemetry_event.dart';
import 'package:aguka_mobile/features/telemetry/bloc/telemetry_state.dart';
import 'package:aguka_mobile/widgets/aguka_app_bar.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:aguka_mobile/injection_container.dart';

class WeatherPage extends StatelessWidget {
  const WeatherPage({Key? key}) : super(key: key);

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
      child: const WeatherView(),
    );
  }
}

class WeatherView extends StatelessWidget {
  const WeatherView({Key? key}) : super(key: key);

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
      body: SafeArea(
        top: false,
        child: Column(
          children: [
            AgukaAppBar(
              title: 'weather.title'.tr(),
              actions: [
                IconButton(
                  icon: const Icon(Icons.refresh),
                  onPressed: () => _refreshData(context),
                ),
              ],
            ),
            Expanded(
              child: BlocBuilder<TelemetryBloc, TelemetryState>(
                builder: (context, state) {
                  if (state.status == TelemetryStatus.initial || state.status == TelemetryStatus.connecting && state.latestData == null) {
                    return Center(child: Text('common.loading'.tr()));
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
                    return const Center(child: Text('No weather data available.'));
                  }

                  return RefreshIndicator(
                    onRefresh: () async => _refreshData(context),
                    child: ListView(
                      padding: const EdgeInsets.all(16.0),
                      children: [
                        _buildCurrentWeather(telemetry.weather.tempC, telemetry.weather.humidity, telemetry.weather.rainfall),
                        const SizedBox(height: 16),
                        _buildHourlyForecast(),
                        const SizedBox(height: 16),
                        _buildWeeklyForecast(),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCurrentWeather(double temp, double humidity, double rainfall) {
    // Simulated wind speed for now since it's not in the entity
    final windSpeed = 12.0; 

    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          gradient: LinearGradient(
            colors: [Colors.blue[400]!, Colors.blue[800]!],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            Text('weather.current_farm'.tr(), style: const TextStyle(color: Colors.white, fontSize: 16)),
            const SizedBox(height: 16),
            const Icon(Icons.wb_sunny, size: 80, color: Colors.yellow),
            const SizedBox(height: 8),
            Text('${temp.toStringAsFixed(1)}°', style: const TextStyle(color: Colors.white, fontSize: 64, fontWeight: FontWeight.bold)),
            Text('weather.optimal_cond'.tr(), style: const TextStyle(color: Colors.white, fontSize: 20)),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildWeatherDetail(Icons.water_drop, 'weather.humidity'.tr(), '${humidity.toStringAsFixed(0)}%'),
                _buildWeatherDetail(Icons.air, 'weather.wind'.tr(), '${windSpeed.toStringAsFixed(0)} km/h'),
                _buildWeatherDetail(Icons.umbrella, 'weather.rain'.tr(), '${rainfall.toStringAsFixed(1)} mm'),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWeatherDetail(IconData icon, String label, String value) {
    return Column(
      children: [
        Icon(icon, color: Colors.white70),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 10)),
      ],
    );
  }

  Widget _buildHourlyForecast() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('weather.today'.tr(), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        const SizedBox(height: 12),
        SizedBox(
          height: 100,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: 8,
            itemBuilder: (context, index) {
              return Card(
                elevation: 1,
                margin: const EdgeInsets.only(right: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text('${12 + index}:00', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                      const SizedBox(height: 8),
                      const Icon(Icons.wb_sunny, color: Colors.orange, size: 24),
                      const SizedBox(height: 8),
                      Text('${24 - index%3}°', style: const TextStyle(fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildWeeklyForecast() {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            _buildDailyRow('Mon', Icons.wb_sunny, Colors.orange, '26°', '15°'),
            const Divider(),
            _buildDailyRow('Tue', Icons.wb_cloudy, Colors.grey, '22°', '14°'),
            const Divider(),
            _buildDailyRow('Wed', Icons.beach_access, Colors.blue, '19°', '13°'),
            const Divider(),
            _buildDailyRow('Thu', Icons.wb_sunny, Colors.orange, '25°', '15°'),
          ],
        ),
      ),
    );
  }

  Widget _buildDailyRow(String day, IconData icon, Color color, String high, String low) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          SizedBox(width: 50, child: Text(day, style: const TextStyle(fontWeight: FontWeight.bold))),
          Icon(icon, color: color),
          Row(
            children: [
              Text(high, style: const TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(width: 16),
              Text(low, style: const TextStyle(color: Colors.grey)),
            ],
          ),
        ],
      ),
    );
  }
}
