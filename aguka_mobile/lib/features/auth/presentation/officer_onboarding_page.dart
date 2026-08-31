import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:aguka_mobile/core/utils/validators.dart';
import 'package:aguka_mobile/features/auth/bloc/auth_bloc.dart';
import 'package:aguka_mobile/features/auth/bloc/auth_event.dart';
import 'package:aguka_mobile/features/auth/bloc/auth_state.dart';

class OfficerOnboardingPage extends StatefulWidget {
  const OfficerOnboardingPage({Key? key}) : super(key: key);

  @override
  State<OfficerOnboardingPage> createState() => _OfficerOnboardingPageState();
}

class _OfficerOnboardingPageState extends State<OfficerOnboardingPage> {
  final _formKey = GlobalKey<FormState>();
  final _employeeIdController = TextEditingController();
  final _organizationController = TextEditingController();
  final List<String> _selectedSpecializations = [];

  void _submit() {
    if (_formKey.currentState?.validate() ?? false) {
      if (_selectedSpecializations.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Select at least one specialization')),
        );
        return;
      }

      final data = {
        'employeeId': _employeeIdController.text.trim(),
        'organization': _organizationController.text.trim(),
        'specializations': _selectedSpecializations,
        'coveredSectors': [], // Optional for now
      };

      context.read<AuthBloc>().add(AuthOnboardingRequested(
        role: 'EXTENSION_OFFICER',
        data: data,
      ));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Officer Profile'),
        backgroundColor: const Color(0xFF0B2D1D),
        foregroundColor: Colors.white,
      ),
      body: BlocConsumer<AuthBloc, AuthState>(
        listener: (context, state) {
          if (state is AuthError) {
            ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(state.message)));
          }
        },
        builder: (context, state) {
          return Padding(
            padding: const EdgeInsets.all(24.0),
            child: Form(
              key: _formKey,
              child: Column(
                children: [
                  TextFormField(
                    controller: _employeeIdController,
                    decoration: const InputDecoration(
                      labelText: 'Employee ID',
                      border: OutlineInputBorder(),
                    ),
                    textInputAction: TextInputAction.next,
                    validator: (v) => Validators.validateRequired(v, 'Employee ID'),
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _organizationController,
                    decoration: const InputDecoration(
                      labelText: 'Organization',
                      border: OutlineInputBorder(),
                    ),
                    textInputAction: TextInputAction.done,
                    validator: (v) => Validators.validateRequired(v, 'Organization'),
                  ),
                  const SizedBox(height: 24),
                  const Text('Specializations', style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    children: ['Agronomy', 'Livestock', 'Irrigation', 'Pest Control'].map((spec) {
                      final isSelected = _selectedSpecializations.contains(spec);
                      return FilterChip(
                        label: Text(spec),
                        selected: isSelected,
                        onSelected: (selected) {
                          setState(() {
                            if (selected) _selectedSpecializations.add(spec);
                            else _selectedSpecializations.remove(spec);
                          });
                        },
                      );
                    }).toList(),
                  ),
                  const Spacer(),
                  SizedBox(
                    width: double.infinity,
                    height: 55,
                    child: ElevatedButton(
                      onPressed: _submit,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0B2D1D),
                        foregroundColor: Colors.white,
                      ),
                      child: const Text('COMPLETE PROFILE'),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  @override
  void dispose() {
    _employeeIdController.dispose();
    _organizationController.dispose();
    super.dispose();
  }
}
