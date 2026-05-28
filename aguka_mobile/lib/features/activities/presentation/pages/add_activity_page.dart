import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import 'package:aguka_mobile/features/activities/data/models/farmer_crop_option_model.dart';
import 'package:aguka_mobile/features/activities/presentation/bloc/activity_bloc.dart';
import 'package:aguka_mobile/features/activities/presentation/bloc/activity_event.dart';
import 'package:aguka_mobile/features/activities/presentation/bloc/activity_state.dart';
import 'package:aguka_mobile/injection_container.dart';
import 'package:aguka_mobile/widgets/aguka_app_bar.dart';

class AddActivityPage extends StatelessWidget {
  const AddActivityPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<ActivityBloc>()..add(FetchActivityFormData()),
      child: const AddActivityView(),
    );
  }
}

class AddActivityView extends StatefulWidget {
  const AddActivityView({Key? key}) : super(key: key);

  @override
  State<AddActivityView> createState() => _AddActivityViewState();
}

class _AddActivityViewState extends State<AddActivityView> {
  final _formKey = GlobalKey<FormState>();
  final _descriptionController = TextEditingController();
  String? _activityType;
  FarmerCropOptionModel? _crop;
  DateTime _activityDate = DateTime.now();

  @override
  void dispose() {
    _descriptionController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<ActivityBloc, ActivityState>(
      listener: (context, state) {
        if (state.status == ActivityStatus.success) {
          Navigator.pop(context, true);
        }
        if (state.status == ActivityStatus.error && state.errorMessage != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(state.errorMessage!)),
          );
        }
      },
      builder: (context, state) {
        return Scaffold(
          appBar: const AgukaAppBar(title: 'Record Activity'),
          body: _buildBody(context, state),
        );
      },
    );
  }

  Widget _buildBody(BuildContext context, ActivityState state) {
    if (state.status == ActivityStatus.loading ||
        state.status == ActivityStatus.initial) {
      return const Center(child: CircularProgressIndicator());
    }

    if (state.status == ActivityStatus.error && state.activityTypes.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline, size: 56, color: Colors.red),
              const SizedBox(height: 16),
              Text(state.errorMessage ?? 'Failed to load form data'),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: () =>
                    context.read<ActivityBloc>().add(FetchActivityFormData()),
                icon: const Icon(Icons.refresh),
                label: const Text('Retry'),
              ),
            ],
          ),
        ),
      );
    }

    if (state.activityTypes.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: const [
              Icon(Icons.list_alt, size: 64, color: Colors.grey),
              SizedBox(height: 16),
              Text(
                'No activity types available',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              SizedBox(height: 8),
              Text(
                'Activity types must come from backend data before recording activities.',
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    return Form(
      key: _formKey,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          DropdownButtonFormField<String>(
            value: _activityType,
            decoration: const InputDecoration(
              labelText: 'Activity type',
              border: OutlineInputBorder(),
            ),
            items: state.activityTypes
                .map((type) => DropdownMenuItem(value: type, child: Text(type)))
                .toList(),
            onChanged: state.status == ActivityStatus.submitting
                ? null
                : (value) => setState(() => _activityType = value),
            validator: (value) =>
                value == null || value.isEmpty ? 'Activity type is required' : null,
          ),
          const SizedBox(height: 12),
          DropdownButtonFormField<FarmerCropOptionModel>(
            value: _crop,
            decoration: const InputDecoration(
              labelText: 'Crop',
              border: OutlineInputBorder(),
            ),
            items: state.crops
                .map((crop) => DropdownMenuItem(
                      value: crop,
                      child: Text(crop.name),
                    ))
                .toList(),
            onChanged: state.status == ActivityStatus.submitting
                ? null
                : (value) => setState(() => _crop = value),
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: _descriptionController,
            maxLines: 4,
            decoration: const InputDecoration(
              labelText: 'Description',
              border: OutlineInputBorder(),
            ),
            validator: (value) =>
                value == null || value.trim().isEmpty ? 'Description is required' : null,
          ),
          const SizedBox(height: 12),
          ListTile(
            contentPadding: EdgeInsets.zero,
            title: const Text('Activity date'),
            subtitle: Text(DateFormat('MMM d, y').format(_activityDate)),
            trailing: const Icon(Icons.calendar_today),
            onTap: state.status == ActivityStatus.submitting
                ? null
                : () async {
                    final picked = await showDatePicker(
                      context: context,
                      initialDate: _activityDate,
                      firstDate: DateTime(2000),
                      lastDate: DateTime.now(),
                    );
                    if (picked != null) {
                      setState(() => _activityDate = picked);
                    }
                  },
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: state.status == ActivityStatus.submitting
                ? null
                : () => _submit(context),
            child: state.status == ActivityStatus.submitting
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Text('Submit'),
          ),
        ],
      ),
    );
  }

  void _submit(BuildContext context) {
    if (!_formKey.currentState!.validate()) return;
    context.read<ActivityBloc>().add(CreateActivityRequested(
          activityType: _activityType!,
          description: _descriptionController.text.trim(),
          activityDate: _activityDate,
          cropId: _crop?.id,
        ));
  }
}
