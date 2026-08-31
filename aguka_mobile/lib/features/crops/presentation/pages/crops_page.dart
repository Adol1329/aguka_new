import 'package:flutter/material.dart';
import 'package:aguka_mobile/features/crops/data/crops_remote_data_source.dart';
import 'package:aguka_mobile/injection_container.dart';

class CropsPage extends StatefulWidget {
  const CropsPage({Key? key}) : super(key: key);

  @override
  State<CropsPage> createState() => _CropsPageState();
}

class _CropsPageState extends State<CropsPage> {
  final _dataSource = sl<CropsRemoteDataSource>();
  bool _isLoading = true;
  String? _error;
  List<Map<String, dynamic>> _crops = [];
  List<Map<String, dynamic>> _catalog = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final results = await Future.wait([
        _dataSource.getMyCrops(),
        _dataSource.getCropCatalog(),
      ]);
      if (!mounted) return;
      setState(() {
        _crops = results[0];
        _catalog = results[1];
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  double? _asDouble(dynamic v) {
    if (v == null) return null;
    if (v is num) return v.toDouble();
    return double.tryParse(v.toString());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Crops')),
      body: RefreshIndicator(
        onRefresh: _load,
        child: _buildBody(),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _catalog.isEmpty ? null : _showAddCropDialog,
        backgroundColor: Colors.green,
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_error != null) {
      return ListView(
        children: [
          const SizedBox(height: 80),
          const Icon(Icons.error_outline, size: 48, color: Colors.red),
          const SizedBox(height: 16),
          Center(child: Text('Failed to load crops: $_error')),
          const SizedBox(height: 16),
          Center(
            child: ElevatedButton(onPressed: _load, child: const Text('Retry')),
          ),
        ],
      );
    }
    if (_crops.isEmpty) {
      return ListView(
        children: const [
          SizedBox(height: 80),
          Icon(Icons.eco_outlined, size: 56, color: Colors.grey),
          SizedBox(height: 16),
          Center(child: Text('No crops registered yet.')),
          SizedBox(height: 8),
          Center(child: Text('Tap + to add your first crop.', style: TextStyle(color: Colors.grey))),
        ],
      );
    }
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: _crops.length,
      separatorBuilder: (_, __) => const SizedBox(height: 8),
      itemBuilder: (context, i) => _buildCropCard(_crops[i]),
    );
  }

  Widget _buildCropCard(Map<String, dynamic> crop) {
    final name = crop['crop']?['nameEn']?.toString() ?? 'Unknown crop';
    final status = crop['status']?.toString() ?? 'planted';
    final plantedDate = DateTime.tryParse(crop['plantedDate']?.toString() ?? '');
    final plotSize = _asDouble(crop['plotSizeHectares']);

    return Card(
      elevation: 1,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: Colors.green.shade50,
          child: const Icon(Icons.eco, color: Colors.green),
        ),
        title: Text(name, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text([
          if (plantedDate != null)
            'Planted ${plantedDate.day}/${plantedDate.month}/${plantedDate.year}',
          if (plotSize != null) '${plotSize.toStringAsFixed(1)} ha',
        ].join(' · ')),
        trailing: Chip(
          label: Text(status, style: const TextStyle(fontSize: 11)),
          backgroundColor: Colors.green.shade50,
        ),
      ),
    );
  }

  void _showAddCropDialog() {
    String? selectedCropId = _catalog.first['id']?.toString();
    DateTime plantedDate = DateTime.now();
    final plotSizeController = TextEditingController();
    bool isSubmitting = false;
    String? errorText;

    showDialog(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          title: const Text('Add Crop'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                DropdownButtonFormField<String>(
                  value: selectedCropId,
                  decoration: const InputDecoration(labelText: 'Crop'),
                  items: _catalog
                      .map((c) => DropdownMenuItem(
                            value: c['id']?.toString(),
                            child: Text(c['nameEn']?.toString() ?? 'Unknown'),
                          ))
                      .toList(),
                  onChanged: (v) => setDialogState(() => selectedCropId = v),
                ),
                const SizedBox(height: 12),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(Icons.calendar_today),
                  title: Text(
                      'Planted: ${plantedDate.day}/${plantedDate.month}/${plantedDate.year}'),
                  onTap: () async {
                    final picked = await showDatePicker(
                      context: ctx,
                      initialDate: plantedDate,
                      firstDate: DateTime.now().subtract(const Duration(days: 365)),
                      lastDate: DateTime.now(),
                    );
                    if (picked != null) {
                      setDialogState(() => plantedDate = picked);
                    }
                  },
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: plotSizeController,
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  decoration: const InputDecoration(labelText: 'Plot size (hectares, optional)'),
                ),
                if (errorText != null) ...[
                  const SizedBox(height: 12),
                  Text(errorText!, style: const TextStyle(color: Colors.red, fontSize: 12)),
                ],
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: isSubmitting ? null : () => Navigator.pop(dialogContext),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: isSubmitting
                  ? null
                  : () async {
                      if (selectedCropId == null) return;
                      setDialogState(() {
                        isSubmitting = true;
                        errorText = null;
                      });
                      try {
                        await _dataSource.addCrop(
                          cropId: selectedCropId!,
                          plantedDate: plantedDate,
                          plotSizeHectares: double.tryParse(plotSizeController.text),
                        );
                        if (!ctx.mounted) return;
                        Navigator.pop(dialogContext);
                        await _load();
                        if (!mounted) return;
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Crop added.')),
                        );
                      } catch (e) {
                        setDialogState(() {
                          isSubmitting = false;
                          errorText = 'Failed to add crop: $e';
                        });
                      }
                    },
              style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
              child: isSubmitting
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : const Text('Add'),
            ),
          ],
        ),
      ),
    );
  }
}
