import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:aguka_mobile/widgets/aguka_app_bar.dart';
import 'package:aguka_mobile/features/auth/bloc/auth_bloc.dart';
import 'package:aguka_mobile/features/auth/bloc/auth_state.dart';
import 'package:aguka_mobile/features/irrigation/presentation/bloc/irrigation_bloc.dart';
import 'package:aguka_mobile/features/irrigation/presentation/bloc/irrigation_event.dart';
import 'package:aguka_mobile/features/irrigation/presentation/bloc/irrigation_state.dart';
import 'package:aguka_mobile/injection_container.dart';

class IrrigationPage extends StatelessWidget {
  const IrrigationPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) {
        final bloc = sl<IrrigationBloc>();
        final authState = context.read<AuthBloc>().state;
        if (authState is AuthAuthenticated) {
          bloc.add(FetchIrrigationStatus(authState.user.id));
        }
        return bloc;
      },
      child: const IrrigationView(),
    );
  }
}

class IrrigationView extends StatelessWidget {
  const IrrigationView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Theme.of(context).scaffoldBackgroundColor,
      child: SafeArea(
        top: false,
        child: Column(
          children: [
            AgukaAppBar(
              title: 'irrigation.title'.tr(),
            ),
            Expanded(
              child: BlocBuilder<IrrigationBloc, IrrigationState>(
                builder: (context, state) {
                  if (state.status == IrrigationStateStatus.initial || (state.status == IrrigationStateStatus.loading && state.data == null)) {
                    return const Center(child: CircularProgressIndicator());
                  }

                  if (state.status == IrrigationStateStatus.error && state.data == null) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.error_outline, size: 48, color: Colors.red),
                          const SizedBox(height: 16),
                          Text(state.errorMessage ?? 'Error loading data'),
                          ElevatedButton(
                            onPressed: () {
                              final authState = context.read<AuthBloc>().state;
                              if (authState is AuthAuthenticated) {
                                context.read<IrrigationBloc>().add(FetchIrrigationStatus(authState.user.id));
                              }
                            },
                            child: const Text('Retry'),
                          )
                        ],
                      ),
                    );
                  }

                  final data = state.data;
                  if (data == null) {
                     return const Center(child: Text('No irrigation data available.'));
                  }

                  return ListView(
                    padding: const EdgeInsets.all(16.0),
                    children: [
                      _buildStatusCard(data.isPumpActive, data.waterUsed, data.percentageSaved),
                      const SizedBox(height: 16),
                      _buildManualControl(context, data.isPumpActive),
                      const SizedBox(height: 16),
                      _buildUpcomingSchedule(),
                    ],
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusCard(bool isPumpActive, double waterUsed, double percentageSaved) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('irrigation.status'.tr(), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    color: isPumpActive ? Colors.green[100] : Colors.grey[200],
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Text(
                    isPumpActive ? 'irrigation.active'.tr() : 'irrigation.idle'.tr(),
                    style: TextStyle(
                      color: isPumpActive ? Colors.green[800] : Colors.grey[700],
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const Divider(height: 32),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildStatItem('irrigation.water_used'.tr(), '${waterUsed.toStringAsFixed(0)} L', Icons.water_drop, Colors.blue),
                _buildStatItem('irrigation.saved'.tr(), '${percentageSaved.toStringAsFixed(0)}%', Icons.savings, Colors.green),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(String label, String value, IconData icon, Color color) {
    return Column(
      children: [
        Icon(icon, color: color),
        const SizedBox(height: 8),
        Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 12)),
      ],
    );
  }

  Widget _buildManualControl(BuildContext context, bool isPumpActive) {
    return Card(
      elevation: 2,
      color: isPumpActive ? Colors.blue[50] : Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: isPumpActive ? Colors.blue[200]! : Colors.transparent),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('irrigation.manual_override'.tr(), style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: isPumpActive ? Colors.red : Colors.blue,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                onPressed: () {
                  HapticFeedback.lightImpact();
                  
                  final authState = context.read<AuthBloc>().state;
                  if (authState is AuthAuthenticated) {
                    context.read<IrrigationBloc>().add(
                      TogglePump(farmId: authState.user.id, isActive: !isPumpActive)
                    );
                    
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('irrigation.command_queued'.tr()),
                        behavior: SnackBarBehavior.floating,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        backgroundColor: Colors.blue[800],
                      ),
                    );
                  }
                },
                icon: Icon(isPumpActive ? Icons.stop : Icons.play_arrow, color: Colors.white),
                label: Text(
                  isPumpActive ? 'irrigation.stop_pump'.tr() : 'irrigation.start_pump'.tr(),
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildUpcomingSchedule() {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('irrigation.smart_schedule'.tr(), style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const CircleAvatar(backgroundColor: Colors.blueAccent, child: Icon(Icons.schedule, color: Colors.white)),
              title: const Text('Evening Watering'),
              subtitle: const Text('Today, 18:00 (15 mins)'),
              trailing: Switch(value: true, onChanged: (v) {}),
            ),
          ],
        ),
      ),
    );
  }
}
