import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:aguka_mobile/core/utils/validators.dart';
import 'package:aguka_mobile/features/auth/bloc/auth_bloc.dart';
import 'package:aguka_mobile/features/auth/bloc/auth_event.dart';
import 'package:aguka_mobile/features/auth/bloc/auth_state.dart';
import 'package:aguka_mobile/injection_container.dart';
import 'package:aguka_mobile/main.dart' show scaffoldMessengerKey;
import 'package:dio/dio.dart';

class FarmerOnboardingPage extends StatefulWidget {
  const FarmerOnboardingPage({Key? key}) : super(key: key);

  @override
  State<FarmerOnboardingPage> createState() => _FarmerOnboardingPageState();
}

class _FarmerOnboardingPageState extends State<FarmerOnboardingPage> {
  final _formKey = GlobalKey<FormState>();
  int _currentStep = 0;

  // Step 1: Location
  String? _selectedProvinceCode;
  String? _selectedDistrictCode;
  String? _selectedSectorCode;
  String? _selectedCellCode;
  String? _selectedVillageCode;

  List<dynamic> _provinces = [];
  List<dynamic> _districts = [];
  List<dynamic> _sectors = [];
  List<dynamic> _cells = [];
  List<dynamic> _villages = [];

  // Step 2: Farm Details
  final _farmSizeController = TextEditingController();
  final List<String> _selectedCrops = [];
  String? _selectedWaterSource;
  String? _selectedIrrigationType;

  final dio = sl<Dio>();

  @override
  void initState() {
    super.initState();
    _loadProvinces();
  }

  Future<void> _loadProvinces() async {
    try {
      final response = await dio.get('/locations/provinces');
      setState(() => _provinces = response.data['data'] ?? []);
    } catch (e) {}
  }

  Future<void> _loadDistricts(String code) async {
    try {
      final response = await dio.get('/locations/districts/$code');
      setState(() => _districts = response.data['data'] ?? []);
    } catch (e) {}
  }

  Future<void> _loadSectors(String code) async {
    try {
      final response = await dio.get('/locations/sectors/$code');
      setState(() => _sectors = response.data['data'] ?? []);
    } catch (e) {}
  }

  Future<void> _loadCells(String code) async {
    try {
      final response = await dio.get('/locations/cells/$code');
      setState(() => _cells = response.data['data'] ?? []);
    } catch (e) {}
  }

  Future<void> _loadVillages(String code) async {
    try {
      final response = await dio.get('/locations/villages/$code');
      setState(() => _villages = response.data['data'] ?? []);
    } catch (e) {}
  }

  void _submit() {
    if (_formKey.currentState?.validate() ?? false) {
      if (_selectedCrops.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Select at least one crop')),
        );
        return;
      }

      final state = context.read<AuthBloc>().state;
      final fullName = (state is AuthAuthenticated)
          ? state.user.fullName
          : (state is AuthRegistered)
              ? state.user.fullName
              : null;
      final data = {
        'fullName': fullName,
        'provinceCode': _selectedProvinceCode,
        'districtCode': _selectedDistrictCode,
        'sectorCode': _selectedSectorCode,
        'cellCode': _selectedCellCode,
        'villageCode': _selectedVillageCode,
        'farmSizeHectares': double.tryParse(_farmSizeController.text.trim()),
        'crops': _selectedCrops,
        'waterSource': _selectedWaterSource ?? 'rainwater',
        'irrigationType': _selectedIrrigationType ?? 'none',
        'district': (_districts.firstWhere(
            (d) => d['code'].toString() == _selectedDistrictCode,
            orElse: () => {'name': ''}) as Map)['name'],
        'sector': (_sectors.firstWhere(
            (s) => s['code'].toString() == _selectedSectorCode,
            orElse: () => {'name': ''}) as Map)['name'],
        'cell': (_cells.firstWhere(
            (c) => c['code'].toString() == _selectedCellCode,
            orElse: () => {'name': ''}) as Map)['name'],
        'village': (_villages.firstWhere(
            (v) => v['code'].toString() == _selectedVillageCode,
            orElse: () => {'name': ''}) as Map)['name'],
      };

      context.read<AuthBloc>().add(AuthOnboardingRequested(
            role: 'FARMER',
            data: data,
          ));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Farm Setup'),
        backgroundColor: const Color(0xFF0B2D1D),
        foregroundColor: Colors.white,
      ),
      body: BlocConsumer<AuthBloc, AuthState>(
        listener: (context, state) {
          if (state is AuthError) {
            ScaffoldMessenger.of(context)
                .showSnackBar(SnackBar(content: Text(state.message)));
          } else if (state is AuthAuthenticated && state.user.cooperativeId != null) {
            scaffoldMessengerKey.currentState?.showSnackBar(
              SnackBar(
                content: const Text('You\'ve been automatically assigned to a cooperative in your area!'),
                backgroundColor: Colors.green.shade700,
                duration: const Duration(seconds: 5),
              ),
            );
          }
        },
        builder: (context, state) {
          return Form(
            key: _formKey,
            child: Stepper(
              type: StepperType.vertical,
              currentStep: _currentStep,
              onStepContinue: () {
                if (_currentStep < 1) {
                  setState(() => _currentStep++);
                } else {
                  _submit();
                }
              },
              onStepCancel: () {
                if (_currentStep > 0) setState(() => _currentStep--);
              },
              steps: [
                Step(
                  title: const Text('Location'),
                  isActive: _currentStep >= 0,
                  content: Column(
                    children: [
                      _buildDropdown<String>(
                        value: _selectedProvinceCode,
                        items: _provinces,
                        hint: 'Province',
                        onChanged: (v) {
                          setState(() {
                            _selectedProvinceCode = v;
                            _selectedDistrictCode = null;
                            _selectedSectorCode = null;
                            _selectedCellCode = null;
                            _selectedVillageCode = null;
                            _districts = [];
                            _sectors = [];
                            _cells = [];
                            _villages = [];
                          });
                          if (v != null) _loadDistricts(v);
                        },
                      ),
                      const SizedBox(height: 12),
                      _buildDropdown<String>(
                        value: _selectedDistrictCode,
                        items: _districts,
                        hint: 'District',
                        enabled: _selectedProvinceCode != null,
                        onChanged: (v) {
                          setState(() {
                            _selectedDistrictCode = v;
                            _selectedSectorCode = null;
                            _selectedCellCode = null;
                            _selectedVillageCode = null;
                            _sectors = [];
                            _cells = [];
                            _villages = [];
                          });
                          if (v != null) _loadSectors(v);
                        },
                      ),
                      const SizedBox(height: 12),
                      _buildDropdown<String>(
                        value: _selectedSectorCode,
                        items: _sectors,
                        hint: 'Sector',
                        enabled: _selectedDistrictCode != null,
                        onChanged: (v) {
                          setState(() {
                            _selectedSectorCode = v;
                            _selectedCellCode = null;
                            _selectedVillageCode = null;
                            _cells = [];
                            _villages = [];
                          });
                          if (v != null) _loadCells(v);
                        },
                      ),
                      const SizedBox(height: 12),
                      _buildDropdown<String>(
                        value: _selectedCellCode,
                        items: _cells,
                        hint: 'Cell',
                        enabled: _selectedSectorCode != null,
                        onChanged: (v) {
                          setState(() {
                            _selectedCellCode = v;
                            _selectedVillageCode = null;
                            _villages = [];
                          });
                          if (v != null) _loadVillages(v);
                        },
                      ),
                      const SizedBox(height: 12),
                      _buildDropdown<String>(
                        value: _selectedVillageCode,
                        items: _villages,
                        hint: 'Village',
                        enabled: _selectedCellCode != null,
                        onChanged: (v) =>
                            setState(() => _selectedVillageCode = v),
                      ),
                    ],
                  ),
                ),
                Step(
                  title: const Text('Farm Details'),
                  isActive: _currentStep >= 1,
                  content: Column(
                    children: [
                      TextFormField(
                        controller: _farmSizeController,
                        decoration: const InputDecoration(
                          labelText: 'Farm Size (Hectares)',
                          border: OutlineInputBorder(),
                        ),
                        keyboardType: TextInputType.number,
                        validator: (value) => Validators.validatePositiveNumber(
                          value,
                          'Farm size',
                          max: 100000,
                        ),
                      ),
                      const SizedBox(height: 16),
                      const Text('What do you grow?',
                          style: TextStyle(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        children: [
                          ('Maize', 'maize'),
                          ('Beans', 'beans'),
                          ('Irish Potato', 'potato'),
                          ('Coffee', 'coffee'),
                          ('Rice', 'rice'),
                          ('Cassava', 'cassava'),
                        ].map(((String label, String id) crop) {
                          final isSelected = _selectedCrops.contains(crop.$2);
                          return FilterChip(
                            label: Text(crop.$1),
                            selected: isSelected,
                            onSelected: (selected) {
                              setState(() {
                                if (selected)
                                  _selectedCrops.add(crop.$2);
                                else
                                  _selectedCrops.remove(crop.$2);
                              });
                            },
                          );
                        }).toList(),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildDropdown<T>({
    required T? value,
    required List<dynamic> items,
    required String hint,
    required Function(T?) onChanged,
    bool enabled = true,
  }) {
    return DropdownButtonFormField<T>(
      initialValue: value,
      items: items.map<DropdownMenuItem<T>>((item) {
        return DropdownMenuItem<T>(
          value: item['code'].toString() as T,
          child: Text(item['name'] ?? ''),
        );
      }).toList(),
      onChanged: enabled ? (v) => onChanged(v) : null,
      decoration: InputDecoration(
        labelText: hint,
        border: const OutlineInputBorder(),
      ),
      validator: (v) => v == null ? 'Selection required' : null,
    );
  }
}
