import 'package:flutter/material.dart';
import 'package:aguka_mobile/shared/data/models/filter_model.dart';
import 'package:aguka_mobile/injection_container.dart';
import 'package:dio/dio.dart';

class FilterBottomSheet extends StatefulWidget {
  final FilterModel initialFilter;
  final Function(FilterModel) onApply;

  const FilterBottomSheet({
    Key? key,
    required this.initialFilter,
    required this.onApply,
  }) : super(key: key);

  static Future<void> show(BuildContext context, {
    required FilterModel currentFilter,
    required Function(FilterModel) onApply,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => FilterBottomSheet(
        initialFilter: currentFilter,
        onApply: onApply,
      ),
    );
  }

  @override
  State<FilterBottomSheet> createState() => _FilterBottomSheetState();
}

class _FilterBottomSheetState extends State<FilterBottomSheet> {
  late FilterModel _filter;
  final _dio = sl<Dio>();
  
  List<dynamic> _provinces = [];
  List<dynamic> _districts = [];
  bool _isLoadingProvinces = false;
  bool _isLoadingDistricts = false;

  final List<String> _crops = ['Maize', 'Beans', 'Rice', 'Potatoes'];
  
  int _selectedDateFilter = -1; // 0: Today, 1: 7 days, 2: 30 days, 3: Custom

  @override
  void initState() {
    super.initState();
    _filter = widget.initialFilter.copyWith();
    _determineDateFilterSelection();
    _loadProvinces();
    if (_filter.provinceCode != null) {
      _loadDistricts(_filter.provinceCode!);
    }
  }

  void _determineDateFilterSelection() {
    if (_filter.dateRange == null) {
      _selectedDateFilter = -1;
      return;
    }
    
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final duration = _filter.dateRange!.end.difference(_filter.dateRange!.start).inDays;

    if (_filter.dateRange!.start == today && _filter.dateRange!.end == today) {
      _selectedDateFilter = 0;
    } else if (duration == 6) { // Last 7 days
      _selectedDateFilter = 1;
    } else if (duration == 29) { // Last 30 days
      _selectedDateFilter = 2;
    } else {
      _selectedDateFilter = 3;
    }
  }

  Future<void> _loadProvinces() async {
    setState(() => _isLoadingProvinces = true);
    try {
      final response = await _dio.get('/locations/provinces');
      final provinces = response.data['data'] ?? [];
      if (mounted) {
        setState(() {
          _provinces = provinces;
          _isLoadingProvinces = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoadingProvinces = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to load provinces')),
        );
      }
    }
  }

  Future<void> _loadDistricts(int provinceCode) async {
    setState(() => _isLoadingDistricts = true);
    try {
      final response = await _dio.get('/locations/districts/$provinceCode');
      final districts = response.data['data'] ?? [];
      if (mounted) {
        setState(() {
          _districts = districts;
          _isLoadingDistricts = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoadingDistricts = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to load districts')),
        );
      }
    }
  }

  void _onProvinceChanged(int? newProvinceCode) {
    setState(() {
      _filter = _filter.copyWith(
        provinceCode: newProvinceCode,
        clearProvince: newProvinceCode == null,
        clearDistrict: true, // Reset district when province changes
      );
      _districts = [];
    });
    if (newProvinceCode != null) {
      _loadDistricts(newProvinceCode);
    }
  }

  Future<void> _selectCustomDateRange() async {
    final DateTimeRange? picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime(2020),
      lastDate: DateTime.now(),
      initialDateRange: _filter.dateRange,
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: ColorScheme.light(
              primary: Colors.green,
              onPrimary: Colors.white,
              surface: Colors.white,
              onSurface: Colors.black,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() {
        _filter.dateRange = picked;
        _selectedDateFilter = 3;
      });
    }
  }

  void _setDateFilter(int index) {
    setState(() {
      _selectedDateFilter = index;
      final now = DateTime.now();
      final today = DateTime(now.year, now.month, now.day);
      
      if (index == 0) {
        _filter.dateRange = DateTimeRange(start: today, end: today);
      } else if (index == 1) {
        _filter.dateRange = DateTimeRange(start: today.subtract(const Duration(days: 6)), end: today);
      } else if (index == 2) {
        _filter.dateRange = DateTimeRange(start: today.subtract(const Duration(days: 29)), end: today);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      height: MediaQuery.of(context).size.height * 0.85,
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            decoration: BoxDecoration(
              border: Border(bottom: BorderSide(color: Colors.grey.shade200)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Filter Data',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),
          
          // Scrollable Content
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildSectionHeader(Icons.calendar_today, 'Date Filter'),
                  _buildDateFilters(),
                  const SizedBox(height: 24),
                  
                  _buildSectionHeader(Icons.eco, 'Crop Type Filter'),
                  _buildCropFilter(),
                  const SizedBox(height: 24),
                  
                  _buildSectionHeader(Icons.location_on, 'Location Filter'),
                  _buildLocationFilters(),
                  const SizedBox(height: 24),
                  
                  _buildSectionHeader(Icons.sensors, 'Sensor Data Filter'),
                  _buildSensorFilters(),
                ],
              ),
            ),
          ),
          
          // Bottom Buttons
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 10,
                  offset: const Offset(0, -5),
                ),
              ],
            ),
            child: Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () {
                      setState(() {
                        _filter = FilterModel();
                        _selectedDateFilter = -1;
                      });
                    },
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('Reset Filters'),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      // Basic validation example
                      if (_filter.minMoisture != null && _filter.maxMoisture != null) {
                        if (_filter.minMoisture! > _filter.maxMoisture!) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Min moisture cannot be greater than max moisture')),
                          );
                          return;
                        }
                      }
                      widget.onApply(_filter);
                      Navigator.pop(context);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('Apply Filters', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(IconData icon, String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Icon(icon, color: Colors.green, size: 20),
          const SizedBox(width: 8),
          Text(
            title,
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  Widget _buildDateFilters() {
    return Column(
      children: [
        Row(
          children: [
            Expanded(child: _buildDateChip(0, 'Today')),
            const SizedBox(width: 12),
            Expanded(child: _buildDateChip(1, 'Last 7 days')),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(child: _buildDateChip(2, 'Last 30 days')),
            const SizedBox(width: 12),
            Expanded(child: _buildDateChip(3, 'Custom', onTap: _selectCustomDateRange)),
          ],
        ),
        if (_selectedDateFilter == 3 && _filter.dateRange != null)
          Padding(
            padding: const EdgeInsets.only(top: 8.0),
            child: Text(
              '${_formatDate(_filter.dateRange!.start)} - ${_formatDate(_filter.dateRange!.end)}',
              style: const TextStyle(color: Colors.green, fontWeight: FontWeight.w500),
            ),
          )
      ],
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }

  Widget _buildDateChip(int index, String label, {VoidCallback? onTap}) {
    final isSelected = _selectedDateFilter == index;
    return InkWell(
      onTap: onTap ?? () => _setDateFilter(index),
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? Colors.green.withValues(alpha: 0.1) : Colors.grey.shade100,
          border: Border.all(color: isSelected ? Colors.green : Colors.transparent),
          borderRadius: BorderRadius.circular(8),
        ),
        alignment: Alignment.center,
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.green : Colors.black87,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ),
    );
  }

  Widget _buildCropFilter() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.grey.shade100,
        borderRadius: BorderRadius.circular(8),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          isExpanded: true,
          value: _filter.crop,
          hint: const Text('Select Crop'),
          items: _crops.map((crop) => DropdownMenuItem(
            value: crop,
            child: Text(crop),
          )).toList(),
          onChanged: (value) {
            setState(() {
              _filter.crop = value;
            });
          },
        ),
      ),
    );
  }

  Widget _buildLocationFilters() {
    return Column(
      children: [
        // Province Dropdown
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          decoration: BoxDecoration(
            color: Colors.grey.shade100,
            borderRadius: BorderRadius.circular(8),
          ),
          child: _isLoadingProvinces
              ? const Padding(
                  padding: EdgeInsets.symmetric(vertical: 16.0),
                  child: Center(child: SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))),
                )
              : DropdownButtonHideUnderline(
                  child: DropdownButton<int>(
                    isExpanded: true,
                    value: _filter.provinceCode,
                    hint: const Text('Select Province'),
                    items: _provinces.map<DropdownMenuItem<int>>((prov) => DropdownMenuItem<int>(
                      value: prov['code'] as int,
                      child: Text(prov['name'] as String),
                    )).toList(),
                    onChanged: _onProvinceChanged,
                  ),
                ),
        ),
        const SizedBox(height: 12),
        // District Dropdown
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          decoration: BoxDecoration(
            color: _filter.provinceCode == null ? Colors.grey.shade200 : Colors.grey.shade100,
            borderRadius: BorderRadius.circular(8),
          ),
          child: _isLoadingDistricts
              ? const Padding(
                  padding: EdgeInsets.symmetric(vertical: 16.0),
                  child: Center(child: SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))),
                )
              : DropdownButtonHideUnderline(
                  child: DropdownButton<int>(
                    isExpanded: true,
                    value: _filter.districtCode,
                    hint: const Text('Select District'),
                    disabledHint: const Text('Select Province First'),
                    items: _filter.provinceCode == null ? [] : _districts.map<DropdownMenuItem<int>>((dist) => DropdownMenuItem<int>(
                      value: dist['code'] as int,
                      child: Text(dist['name'] as String),
                    )).toList(),
                    onChanged: _filter.provinceCode == null ? null : (value) {
                      setState(() {
                        _filter.districtCode = value;
                      });
                    },
                  ),
                ),
        ),
      ],
    );
  }

  Widget _buildSensorFilters() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Moisture Slider
        const Text('Soil Moisture Range (%)'),
        RangeSlider(
          values: RangeValues(
            _filter.minMoisture ?? 0,
            _filter.maxMoisture ?? 100,
          ),
          min: 0,
          max: 100,
          divisions: 20,
          labels: RangeLabels(
            '${_filter.minMoisture?.round() ?? 0}%',
            '${_filter.maxMoisture?.round() ?? 100}%',
          ),
          activeColor: Colors.blue,
          onChanged: (values) {
            setState(() {
              _filter.minMoisture = values.start;
              _filter.maxMoisture = values.end;
            });
          },
        ),
        
        const SizedBox(height: 8),
        
        // Temperature Slider
        const Text('Temperature Range (°C)'),
        RangeSlider(
          values: RangeValues(
            _filter.minTemp ?? 0,
            _filter.maxTemp ?? 50,
          ),
          min: 0,
          max: 50,
          divisions: 50,
          labels: RangeLabels(
            '${_filter.minTemp?.round() ?? 0}°C',
            '${_filter.maxTemp?.round() ?? 50}°C',
          ),
          activeColor: Colors.orange,
          onChanged: (values) {
            setState(() {
              _filter.minTemp = values.start;
              _filter.maxTemp = values.end;
            });
          },
        ),
        
        const SizedBox(height: 8),
        
        // Rainfall Toggle
        SwitchListTile(
          contentPadding: EdgeInsets.zero,
          title: const Text('Has Rainfall'),
          value: _filter.hasRain ?? false,
          activeThumbColor: Colors.green,
          onChanged: (value) {
            setState(() {
              _filter.hasRain = value;
            });
          },
        ),
      ],
    );
  }
}
