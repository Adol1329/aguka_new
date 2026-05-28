import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:aguka_mobile/features/guidance/presentation/bloc/guidance_bloc.dart';
import 'package:aguka_mobile/features/guidance/presentation/bloc/guidance_event.dart';
import 'package:aguka_mobile/features/guidance/presentation/bloc/guidance_state.dart';
import 'package:aguka_mobile/injection_container.dart';
import 'package:aguka_mobile/widgets/aguka_app_bar.dart';

class LivestockDetailPage extends StatelessWidget {
  final String livestockId;

  const LivestockDetailPage({Key? key, required this.livestockId}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<GuidanceBloc>()..add(FetchLivestockGuidance(livestockId)),
      child: const LivestockDetailView(),
    );
  }
}

class LivestockDetailView extends StatelessWidget {
  const LivestockDetailView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<GuidanceBloc, GuidanceState>(
      builder: (context, state) {
        final guidance = state.livestockGuidance;
        return Scaffold(
          appBar: AgukaAppBar(
            title: guidance?.livestock.animalType ?? 'Livestock Guidance',
          ),
          body: _buildBody(state),
        );
      },
    );
  }

  Widget _buildBody(GuidanceState state) {
    if (state.status == GuidanceStatus.loading ||
        state.status == GuidanceStatus.initial) {
      return const Center(child: CircularProgressIndicator());
    }

    if (state.status == GuidanceStatus.error) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text(state.errorMessage ?? 'Failed to load livestock guidance'),
        ),
      );
    }

    final guidance = state.livestockGuidance;
    if (guidance == null) return const SizedBox.shrink();

    return ListView(
      padding: const EdgeInsets.all(16),
      children: guidance.fields.entries
          .map((entry) => Card(
                child: ListTile(
                  title: Text(entry.key),
                  subtitle: Text(entry.value?.toString() ?? '-'),
                ),
              ))
          .toList(),
    );
  }
}
