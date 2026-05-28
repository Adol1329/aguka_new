import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:aguka_mobile/features/activities/presentation/bloc/activity_bloc.dart';
import 'package:aguka_mobile/features/activities/presentation/bloc/activity_event.dart';
import 'package:aguka_mobile/features/activities/presentation/bloc/activity_state.dart';
import 'package:aguka_mobile/features/activities/presentation/pages/add_activity_page.dart';
import 'package:aguka_mobile/features/activities/presentation/widgets/activity_card.dart';
import 'package:aguka_mobile/injection_container.dart';
import 'package:aguka_mobile/widgets/aguka_app_bar.dart';

class ActivitiesPage extends StatelessWidget {
  const ActivitiesPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<ActivityBloc>()..add(FetchActivities()),
      child: const ActivitiesView(),
    );
  }
}

class ActivitiesView extends StatelessWidget {
  const ActivitiesView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const AgukaAppBar(title: 'Activities'),
      floatingActionButton: FloatingActionButton(
        heroTag: 'activities_fab',
        onPressed: () async {
          final created = await Navigator.push<bool>(
            context,
            MaterialPageRoute(builder: (_) => const AddActivityPage()),
          );
          if (created == true && context.mounted) {
            context.read<ActivityBloc>().add(FetchActivities());
          }
        },
        child: const Icon(Icons.add),
      ),
      body: BlocBuilder<ActivityBloc, ActivityState>(
        builder: (context, state) {
          if (state.status == ActivityStatus.loading ||
              state.status == ActivityStatus.initial) {
            return const Center(child: CircularProgressIndicator());
          }

          if (state.status == ActivityStatus.error) {
            return _ErrorState(
              message: state.errorMessage ?? 'Failed to load activities',
              onRetry: () => context.read<ActivityBloc>().add(FetchActivities()),
            );
          }

          if (state.activities.isEmpty) {
            return _EmptyState(
              icon: Icons.assignment_outlined,
              title: 'No activities recorded yet',
              message: 'Record your first activity',
              actionLabel: 'Record activity',
              onAction: () async {
                final created = await Navigator.push<bool>(
                  context,
                  MaterialPageRoute(builder: (_) => const AddActivityPage()),
                );
                if (created == true && context.mounted) {
                  context.read<ActivityBloc>().add(FetchActivities());
                }
              },
            );
          }

          return RefreshIndicator(
            onRefresh: () async {
              context.read<ActivityBloc>().add(FetchActivities());
            },
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: state.activities.length,
              itemBuilder: (context, index) =>
                  ActivityCard(activity: state.activities[index]),
            ),
          );
        },
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
      child: Padding(
        padding: const EdgeInsets.all(24),
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
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String message;
  final String actionLabel;
  final VoidCallback onAction;

  const _EmptyState({
    required this.icon,
    required this.title,
    required this.message,
    required this.actionLabel,
    required this.onAction,
  });

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
            Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text(message, textAlign: TextAlign.center),
            const SizedBox(height: 16),
            ElevatedButton(onPressed: onAction, child: Text(actionLabel)),
          ],
        ),
      ),
    );
  }
}
