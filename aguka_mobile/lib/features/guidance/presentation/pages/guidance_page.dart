import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:aguka_mobile/features/guidance/presentation/bloc/guidance_bloc.dart';
import 'package:aguka_mobile/features/guidance/presentation/bloc/guidance_event.dart';
import 'package:aguka_mobile/features/guidance/presentation/bloc/guidance_state.dart';
import 'package:aguka_mobile/features/guidance/presentation/pages/crop_detail_page.dart';
import 'package:aguka_mobile/features/guidance/presentation/pages/livestock_detail_page.dart';
import 'package:aguka_mobile/features/guidance/presentation/widgets/crop_card.dart';
import 'package:aguka_mobile/features/guidance/presentation/widgets/livestock_card.dart';
import 'package:aguka_mobile/injection_container.dart';
import 'package:aguka_mobile/widgets/aguka_app_bar.dart';

class GuidancePage extends StatelessWidget {
  const GuidancePage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<GuidanceBloc>()..add(FetchGuidanceOverview()),
      child: const GuidanceView(),
    );
  }
}

class GuidanceView extends StatelessWidget {
  const GuidanceView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: const AgukaAppBar(
          title: 'Guidance',
          bottom: TabBar(tabs: [Tab(text: 'Crops'), Tab(text: 'Livestock')]),
        ),
        body: BlocBuilder<GuidanceBloc, GuidanceState>(
          builder: (context, state) {
            if (state.status == GuidanceStatus.loading ||
                state.status == GuidanceStatus.initial) {
              return const Center(child: CircularProgressIndicator());
            }

            if (state.status == GuidanceStatus.error) {
              return _ErrorState(
                message: state.errorMessage ?? 'Failed to load guidance',
                onRetry: () => context.read<GuidanceBloc>().add(FetchGuidanceOverview()),
              );
            }

            return TabBarView(
              children: [
                state.crops.isEmpty
                    ? const _EmptyState(
                        icon: Icons.eco_outlined,
                        message: 'No crops registered yet. Add crops from your farm profile.',
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: state.crops.length,
                        itemBuilder: (context, index) {
                          final crop = state.crops[index];
                          return CropCard(
                            crop: crop,
                            onTap: () => Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => CropDetailPage(farmerCropId: crop.id),
                              ),
                            ),
                          );
                        },
                      ),
                state.livestock.isEmpty
                    ? const _EmptyState(
                        icon: Icons.pets_outlined,
                        message: 'No livestock recorded yet.',
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: state.livestock.length,
                        itemBuilder: (context, index) {
                          final item = state.livestock[index];
                          return LivestockCard(
                            livestock: item,
                            onTap: () => Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => LivestockDetailPage(livestockId: item.id),
                              ),
                            ),
                          );
                        },
                      ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _ErrorState extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const _ErrorState({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.error_outline, size: 56, color: Colors.red),
          const SizedBox(height: 16),
          Text(message, textAlign: TextAlign.center),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: onRetry,
            icon: const Icon(Icons.refresh),
            label: const Text('Retry'),
          ),
        ],
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  final IconData icon;
  final String message;

  const _EmptyState({required this.icon, required this.message});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 64, color: Colors.grey),
            const SizedBox(height: 16),
            Text(message, textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}
