import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:aguka_mobile/shared/bloc/filter/filter_bloc.dart';
import 'package:aguka_mobile/shared/bloc/filter/filter_event.dart';
import 'package:aguka_mobile/shared/data/models/filter_model.dart';
import 'package:aguka_mobile/injection_container.dart';
import 'package:dio/dio.dart';

class FilterDrawer extends StatefulWidget {
  const FilterDrawer({Key? key}) : super(key: key);

  @override
  State<FilterDrawer> createState() => _FilterDrawerState();
}

class _FilterDrawerState extends State<FilterDrawer> {
  final _dio = sl<Dio>();
  late FilterModel _tempFilter;
  
  List<dynamic> _provinces = [];
  List<dynamic> _districts = [];
  
  bool _isLoadingLoc = false;

  @override
  void initState() {
    super.initState();
    _tempFilter = context.read<FilterBloc>().state.filter.copyWith();
    _loadProvinces();
    if (_tempFilter.provinceCode != null) _loadDistricts(_tempFilter.provinceCode!);
  }

  Future<void> _loadProvinces() async {
    setState(() => _isLoadingLoc = true);
    try {
      final response = await _dio.get('/locations/provinces');
      _provinces = response.data['data'] ?? [];
    } catch (e) {
      debugPrint('Error loading provinces: $e');
    } finally {
      setState(() => _isLoadingLoc = false);
    }
  }

  Future<void> _loadDistricts(int provinceCode) async {
    setState(() => _isLoadingLoc = true);
    try {
      final response = await _dio.get('/locations/districts/$provinceCode');
      _districts = response.data['data'] ?? [];
    } catch (e) {
      debugPrint('Error loading districts: $e');
    } finally {
      setState(() => _isLoadingLoc = false);
    }
  }

  // Future methods for Sector, Cell, Village loading can be added here

  @override
  Widget build(BuildContext context) {
    return Drawer(
      width: MediaQuery.of(context).size.width * 0.85,
      child: Scaffold(
        appBar: AppBar(
          title: Text('filter.title'.tr()),
          automaticallyImplyLeading: false,
          actions: [
            IconButton(
              icon: const Icon(Icons.close),
              onPressed: () => Navigator.pop(context),
            ),
          ],
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildSectionTitle('filter.location'.tr()),
              _buildLocationDropdowns(),
              const SizedBox(height: 25),
              
              _buildSectionTitle('filter.date_range'.tr()),
              _buildDateRangeSelector(),
              const SizedBox(height: 25),
              
              _buildSectionTitle('filter.crop_type'.tr()),
              _buildCropSelector(),
              const SizedBox(height: 25),
              
              _buildSectionTitle('filter.sensor_data'.tr()),
              _buildSensorFilters(),
            ],
          ),
        ),
        bottomNavigationBar: _buildBottomButtons(),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 15),
      child: Text(
        title,
        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.green),
      ),
    );
  }

  Widget _buildLocationDropdowns() {
    if (_isLoadingLoc && _provinces.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }

    return Column(
      children: [
        _buildDropdown<int>(
          label: 'filter.province'.tr(),
          value: _tempFilter.provinceCode,
          items: _provinces.map((p) => DropdownMenuItem<int>(
            value: p['code'] as int,
            child: Text(p['name'] as String),
          )).toList(),
          onChanged: (val) {
            setState(() {
              _tempFilter.provinceCode = val;
              _tempFilter.districtCode = null;
              _districts = [];
            });
            if (val != null) _loadDistricts(val);
          },
        ),
        const SizedBox(height: 10),
        _isLoadingLoc && _districts.isEmpty && _tempFilter.provinceCode != null
          ? const LinearProgressIndicator()
          : _buildDropdown<int>(
              label: 'filter.district'.tr(),
              value: _tempFilter.districtCode,
              items: _districts.map((d) => DropdownMenuItem<int>(
                value: d['code'] as int,
                child: Text(d['name'] as String),
              )).toList(),
              onChanged: (val) => setState(() => _tempFilter.districtCode = val),
            ),
      ],
    );
  }

  Widget _buildDateRangeSelector() {
    return Column(
      children: [
        Wrap(
          spacing: 10,
          children: [
            _buildDateChip('filter.today'.tr(), 0),
            _buildDateChip('filter.last_7_days'.tr(), 7),
            _buildDateChip('filter.last_30_days'.tr(), 30),
          ],
        ),
        const SizedBox(height: 10),
        OutlinedButton.icon(
          onPressed: _selectCustomDateRange,
          icon: const Icon(Icons.calendar_today, size: 18),
          label: Text(_tempFilter.dateRange != null 
            ? '${DateFormat('yyyy-MM-dd').format(_tempFilter.dateRange!.start)} - ${DateFormat('yyyy-MM-dd').format(_tempFilter.dateRange!.end)}'
            : 'filter.custom_range'.tr()),
        ),
      ],
    );
  }

  Widget _buildDateChip(String label, int days) {
    bool isSelected = false; // Add logic to check if days match current range
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (selected) {
        if (selected) {
          setState(() {
            final now = DateTime.now();
            _tempFilter.dateRange = DateTimeRange(
              start: now.subtract(Duration(days: days)),
              end: now,
            );
          });
        }
      },
    );
  }

  Future<void> _selectCustomDateRange() async {
    final range = await showDateRangePicker(
      context: context,
      firstDate: DateTime(2020),
      lastDate: DateTime.now(),
      initialDateRange: _tempFilter.dateRange,
    );
    if (range != null) setState(() => _tempFilter.dateRange = range);
  }

  Widget _buildCropSelector() {
    final crops = ['Maize', 'Beans', 'Rice', 'Potatoes'];
    return _buildDropdown<String>(
      label: 'filter.select_crop'.tr(),
      value: _tempFilter.crop,
      items: crops.map((c) => DropdownMenuItem<String>(
        value: c,
        child: Text(c),
      )).toList(),
      onChanged: (val) => setState(() => _tempFilter.crop = val),
    );
  }

  Widget _buildSensorFilters() {
    return Column(
      children: [
        _buildRangeSlider(
          label: 'soil.moisture'.tr() + ' (%)',
          values: RangeValues(_tempFilter.minMoisture ?? 0, _tempFilter.maxMoisture ?? 100),
          min: 0,
          max: 100,
          onChanged: (v) => setState(() {
            _tempFilter.minMoisture = v.start;
            _tempFilter.maxMoisture = v.end;
          }),
        ),
        _buildRangeSlider(
          label: 'weather.temp'.tr() + ' (°C)',
          values: RangeValues(_tempFilter.minTemp ?? 0, _tempFilter.maxTemp ?? 50),
          min: 0,
          max: 50,
          onChanged: (v) => setState(() {
            _tempFilter.minTemp = v.start;
            _tempFilter.maxTemp = v.end;
          }),
        ),
        SwitchListTile(
          title: Text('filter.rainfall'.tr()),
          value: _tempFilter.hasRain ?? false,
          activeThumbColor: Colors.green,
          onChanged: (v) => setState(() => _tempFilter.hasRain = v),
        ),
      ],
    );
  }

  Widget _buildDropdown<T>({
    required String label,
    required T? value,
    required List<DropdownMenuItem<T>> items,
    required ValueChanged<T?> onChanged,
  }) {
    return DropdownButtonFormField<T>(
      decoration: InputDecoration(
        labelText: label,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      ),
      initialValue: value,
      items: items,
      onChanged: onChanged,
    );
  }

  Widget _buildRangeSlider({
    required String label,
    required RangeValues values,
    required double min,
    required double max,
    required ValueChanged<RangeValues> onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('$label: ${values.start.round()} - ${values.end.round()}'),
        RangeSlider(
          values: values,
          min: min,
          max: max,
          divisions: (max - min).toInt(),
          activeColor: Colors.green,
          onChanged: onChanged,
        ),
      ],
    );
  }

  Widget _buildBottomButtons() {
    return Container(
      padding: const EdgeInsets.all(20),
      child: Row(
        children: [
          Expanded(
            child: OutlinedButton(
              onPressed: () {
                context.read<FilterBloc>().add(FilterReset());
                Navigator.pop(context);
              },
              child: Text('filter.reset'.tr()),
            ),
          ),
          const SizedBox(width: 15),
          Expanded(
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: Colors.green, foregroundColor: Colors.white),
              onPressed: () {
                context.read<FilterBloc>().add(FilterUpdated(_tempFilter));
                Navigator.pop(context);
              },
              child: Text('filter.apply'.tr()),
            ),
          ),
        ],
      ),
    );
  }
}
