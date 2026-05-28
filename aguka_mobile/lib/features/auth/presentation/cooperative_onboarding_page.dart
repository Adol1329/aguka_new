import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:aguka_mobile/features/auth/bloc/auth_bloc.dart';
import 'package:aguka_mobile/features/auth/bloc/auth_event.dart';
import 'package:aguka_mobile/features/auth/bloc/auth_state.dart';

class CooperativeOnboardingPage extends StatefulWidget {
  const CooperativeOnboardingPage({Key? key}) : super(key: key);

  @override
  State<CooperativeOnboardingPage> createState() => _CooperativeOnboardingPageState();
}

class _CooperativeOnboardingPageState extends State<CooperativeOnboardingPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _regNumberController = TextEditingController();
  final _memberCountController = TextEditingController();
  String? _selectedType;

  void _submit() {
    if (_formKey.currentState?.validate() ?? false) {
      final data = {
        'cooperativeName': _nameController.text,
        'registrationNumber': _regNumberController.text,
        'cooperativeType': _selectedType ?? 'CROP',
        'memberCount': int.tryParse(_memberCountController.text) ?? 0,
      };

      context.read<AuthBloc>().add(AuthOnboardingRequested(
        role: 'COOPERATIVE_MANAGER',
        data: data,
      ));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Cooperative Setup'),
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
                    controller: _nameController,
                    decoration: const InputDecoration(
                      labelText: 'Cooperative Name',
                      border: OutlineInputBorder(),
                    ),
                    validator: (v) => v!.isEmpty ? 'Required' : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _regNumberController,
                    decoration: const InputDecoration(
                      labelText: 'RCA Registration Number',
                      border: OutlineInputBorder(),
                    ),
                    validator: (v) => v!.isEmpty ? 'Required' : null,
                  ),
                  const SizedBox(height: 16),
                  DropdownButtonFormField<String>(
                    value: _selectedType,
                    items: ['CROP', 'LIVESTOCK', 'MULTI_PURPOSE', 'IRRIGATION']
                        .map((t) => DropdownMenuItem(value: t, child: Text(t)))
                        .toList(),
                    onChanged: (v) => setState(() => _selectedType = v),
                    decoration: const InputDecoration(
                      labelText: 'Cooperative Type',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _memberCountController,
                    decoration: const InputDecoration(
                      labelText: 'Number of Members',
                      border: OutlineInputBorder(),
                    ),
                    keyboardType: TextInputType.number,
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
                      child: const Text('REGISTER COOPERATIVE'),
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
}
