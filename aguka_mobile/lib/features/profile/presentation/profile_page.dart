import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:aguka_mobile/features/auth/bloc/auth_bloc.dart';
import 'package:aguka_mobile/features/auth/bloc/auth_event.dart';
import 'package:aguka_mobile/features/auth/domain/entities/user_entity.dart';
import 'package:aguka_mobile/features/profile/presentation/profile_cubit.dart';
import 'package:aguka_mobile/injection_container.dart';
import 'package:aguka_mobile/widgets/aguka_app_bar.dart';

class ProfilePage extends StatelessWidget {
  const ProfilePage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<ProfileCubit>()..loadProfile(),
      child: const ProfileView(),
    );
  }
}

class ProfileView extends StatefulWidget {
  const ProfileView({Key? key}) : super(key: key);

  @override
  State<ProfileView> createState() => _ProfileViewState();
}

class _ProfileViewState extends State<ProfileView> {
  final _formKey = GlobalKey<FormState>();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _districtController = TextEditingController();
  final _sectorController = TextEditingController();
  final _cellController = TextEditingController();
  final _villageController = TextEditingController();
  final _farmSizeController = TextEditingController();
  final _primaryCropController = TextEditingController();
  String? _loadedProfileId;

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _districtController.dispose();
    _sectorController.dispose();
    _cellController.dispose();
    _villageController.dispose();
    _farmSizeController.dispose();
    _primaryCropController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<ProfileCubit, ProfileState>(
      listenWhen: (previous, current) =>
          previous.saveSuccess != current.saveSuccess ||
          previous.errorMessage != current.errorMessage,
      listener: (context, state) {
        if (state.profile != null && _loadedProfileId != state.profile!.id) {
          _populateFields(state.profile!);
        }
        if (state.saveSuccess) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('profile.message.updated_successfully'.tr())),
          );
        }
        if (state.errorMessage != null && state.status != ProfileStatus.error) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(state.errorMessage!)),
          );
        }
      },
      builder: (context, state) {
        return Scaffold(
          appBar: AgukaAppBar(
            title: 'profile.title'.tr(),
            actions: [
              if (state.status == ProfileStatus.loaded && !state.isEditing)
                IconButton(
                  icon: const Icon(Icons.edit),
                  onPressed: () => context.read<ProfileCubit>().startEditing(),
                ),
            ],
          ),
          body: _buildBody(context, state),
        );
      },
    );
  }

  Widget _buildBody(BuildContext context, ProfileState state) {
    if (state.status == ProfileStatus.loading ||
        state.status == ProfileStatus.initial) {
      return const Center(child: CircularProgressIndicator());
    }

    if (state.status == ProfileStatus.error) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline, size: 56, color: Colors.red),
              const SizedBox(height: 16),
              Text(
                state.errorMessage ?? 'profile.error.failed_to_load'.tr(),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: () => context.read<ProfileCubit>().loadProfile(),
                icon: const Icon(Icons.refresh),
                label: Text('common.retry'.tr()),
              ),
            ],
          ),
        ),
      );
    }

    final readOnly = !state.isEditing || state.status == ProfileStatus.saving;
    return Form(
      key: _formKey,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildHeader(state.profile),
          const SizedBox(height: 24),
          _textField('profile.field.first_name'.tr(), _firstNameController, readOnly),
          _textField('profile.field.last_name'.tr(), _lastNameController, readOnly),
          _textField('profile.field.district'.tr(), _districtController, readOnly),
          _textField('profile.field.sector'.tr(), _sectorController, readOnly),
          _textField('profile.field.cell'.tr(), _cellController, readOnly),
          _textField('profile.field.village'.tr(), _villageController, readOnly),
          _textField(
            'profile.field.farm_size'.tr(),
            _farmSizeController,
            readOnly,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            required: false,
          ),
          _textField(
            'profile.field.primary_crop'.tr(),
            _primaryCropController,
            readOnly,
            required: false,
          ),
          const SizedBox(height: 24),
          if (state.isEditing)
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: state.status == ProfileStatus.saving
                        ? null
                        : () => context.read<ProfileCubit>().cancelEditing(),
                    child: Text('common.cancel'.tr()),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: state.status == ProfileStatus.saving
                        ? null
                        : () => _save(context),
                    child: state.status == ProfileStatus.saving
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : Text('common.save'.tr()),
                  ),
                ),
              ],
            ),
          const SizedBox(height: 24),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red[50],
              foregroundColor: Colors.red,
              elevation: 0,
            ),
            onPressed: () => _showLogoutDialog(context),
            child: Text('profile.logout'.tr().toUpperCase()),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(UserEntity? profile) {
    return Row(
      children: [
        CircleAvatar(
          radius: 36,
          backgroundColor: Colors.green[100],
          child: const Icon(Icons.person, size: 36, color: Colors.green),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                profile?.fullName ?? '',
                style:
                    const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
              ),
              if (profile?.phone.isNotEmpty == true)
                Text(profile!.phone, style: TextStyle(color: Colors.grey[600])),
            ],
          ),
        ),
      ],
    );
  }

  Widget _textField(
    String label,
    TextEditingController controller,
    bool readOnly, {
    TextInputType? keyboardType,
    bool required = true,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextFormField(
        controller: controller,
        readOnly: readOnly,
        keyboardType: keyboardType,
        decoration: InputDecoration(
          labelText: label,
          border: const OutlineInputBorder(),
        ),
        validator: required
            ? (value) =>
                value == null || value.trim().isEmpty ? '$label is required' : null
            : null,
      ),
    );
  }

  void _populateFields(UserEntity profile) {
    _loadedProfileId = profile.id;
    final parts = (profile.fullName ?? '').trim().split(RegExp(r'\s+'));
    _firstNameController.text = parts.isNotEmpty ? parts.first : '';
    _lastNameController.text =
        parts.length > 1 ? parts.sublist(1).join(' ') : '';
    _districtController.text = profile.district ?? '';
    _sectorController.text = profile.sector ?? '';
    _cellController.text = profile.cell ?? '';
    _villageController.text = profile.village ?? '';
    _farmSizeController.text = profile.farmSize?.toString() ?? '';
    _primaryCropController.text = profile.crops?.isNotEmpty == true
        ? profile.crops!.first
        : '';
  }

  void _save(BuildContext context) {
    if (!_formKey.currentState!.validate()) return;
    context.read<ProfileCubit>().saveProfile(
          firstName: _firstNameController.text.trim(),
          lastName: _lastNameController.text.trim(),
          district: _districtController.text.trim(),
          sector: _sectorController.text.trim(),
          cell: _cellController.text.trim(),
          village: _villageController.text.trim(),
          farmSize: _farmSizeController.text.trim(),
          primaryCrop: _primaryCropController.text.trim(),
        );
  }

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('profile.logout'.tr()),
        content: Text('profile.logout_confirm'.tr()),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('common.cancel'.tr()),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              context.read<AuthBloc>().add(AuthLogoutRequested());
            },
            child: Text('profile.logout'.tr(), style: const TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }
}
