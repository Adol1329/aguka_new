import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:aguka_mobile/features/guidance/presentation/bloc/guidance_bloc.dart';
import 'package:aguka_mobile/features/guidance/presentation/bloc/guidance_event.dart';
import 'package:aguka_mobile/features/guidance/presentation/bloc/guidance_state.dart';
import 'package:aguka_mobile/injection_container.dart';
import 'package:aguka_mobile/widgets/aguka_app_bar.dart';

class CropDetailPage extends StatelessWidget {
  final String farmerCropId;

  const CropDetailPage({Key? key, required this.farmerCropId}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<GuidanceBloc>()..add(FetchCropGuidance(farmerCropId)),
      child: const CropDetailView(),
    );
  }
}

class CropDetailView extends StatelessWidget {
  const CropDetailView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<GuidanceBloc, GuidanceState>(
      builder: (context, state) {
        final guidance = state.cropGuidance;
        return Scaffold(
          appBar: AgukaAppBar(title: guidance?.cropName ?? 'Crop Guidance'),
          body: _buildBody(context, state),
        );
      },
    );
  }

  Widget _buildBody(BuildContext context, GuidanceState state) {
    if (state.status == GuidanceStatus.loading ||
        state.status == GuidanceStatus.initial) {
      return const Center(child: CircularProgressIndicator());
    }

    if (state.status == GuidanceStatus.error) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text(state.errorMessage ?? 'Failed to load crop guidance'),
        ),
      );
    }

    final guidance = state.cropGuidance;
    if (guidance == null) return const SizedBox.shrink();

    return ListView(
      padding: const EdgeInsets.all(16),
      children: guidance.fields.entries
          .where((entry) => entry.key != 'farmerCrop')
          .map((entry) => _GuidanceRow(label: entry.key, value: entry.value))
          .toList(),
    );
  }
}

class _GuidanceRow extends StatelessWidget {
  final String label;
  final dynamic value;

  const _GuidanceRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        title: Text(label),
        subtitle: Text(value?.toString() ?? '-'),
      ),
    );
  }
}
