import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:aguka_mobile/shared/data/local/database_helper.dart';
import 'package:aguka_mobile/shared/data/local/sync_service.dart';
import 'package:aguka_mobile/features/market/data/market_alerts_remote_data_source.dart';
import 'package:aguka_mobile/widgets/market_trend_chart.dart';
import 'package:aguka_mobile/widgets/aguka_app_bar.dart';
import 'package:aguka_mobile/injection_container.dart';

class MarketPage extends StatefulWidget {
  const MarketPage({Key? key}) : super(key: key);

  @override
  State<MarketPage> createState() => _MarketPageState();
}

class _MarketPageState extends State<MarketPage> {
  final dbHelper = DatabaseHelper.instance;
  final syncService = sl<SyncService>();
  final marketAlertsDataSource = sl<MarketAlertsRemoteDataSource>();
  List<Map<String, dynamic>> _marketPrices = [];
  List<Map<String, dynamic>> _priceAlerts = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadMarketData();
  }

  Future<void> _loadMarketData() async {
    if (!mounted) return;
    setState(() => _isLoading = true);
    final prices = await dbHelper.getMarketPrices();
    List<Map<String, dynamic>> alerts = [];
    bool alertsFailed = false;
    try {
      alerts = await marketAlertsDataSource.getAlerts();
    } catch (_) {
      alertsFailed = true;
    }

    if (!mounted) return;
    setState(() {
      _marketPrices = prices;
      _priceAlerts = alerts;
      _isLoading = false;
    });
    if (alertsFailed) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Could not load price alerts.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Theme.of(context).scaffoldBackgroundColor,
      child: SafeArea(
        top: false,
        child: Stack(
          children: [
            Column(
              children: [
                AgukaAppBar(
                  title: 'market.title'.tr(),
                  actions: [
                    IconButton(
                      icon: const Icon(Icons.search),
                      onPressed: () {},
                    ),
                  ],
                ),
                Expanded(
                  child: RefreshIndicator(
                    onRefresh: () async {
                      await syncService.runFullSync('my_farm_id');
                      await _loadMarketData();
                    },
                    child: _isLoading 
                      ? const Center(child: CircularProgressIndicator())
                      : SingleChildScrollView(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            children: [
                              _buildMarketPricesSection(),
                              const SizedBox(height: 16),
                              _buildPriceAlertsSection(),
                            ],
                          ),
                        ),
                  ),
                ),
              ],
            ),
            Positioned(
              bottom: 16,
              right: 16,
              child: FloatingActionButton(
                heroTag: 'market_fab',
                onPressed: _showAddAlertDialog,
                backgroundColor: Colors.green,
                child: const Icon(Icons.add_alert),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMarketPricesSection() {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'market.current_prices'.tr(),
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                IconButton(
                  icon: const Icon(Icons.refresh),
                  onPressed: _loadMarketData,
                ),
              ],
            ),
            const SizedBox(height: 8),
            const MarketTrendChart(
              cropName: 'Maize',
              prices: [320, 310, 330, 340, 335, 350, 345],
            ),
            const Divider(),
            const SizedBox(height: 8),
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _marketPrices.length,
              itemBuilder: (context, index) {
                final price = _marketPrices[index];
                return ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: CircleAvatar(
                    backgroundColor: Colors.green.shade50,
                    child: const Icon(Icons.eco, color: Colors.green),
                  ),
                  title: Text(price['crop_name'] ?? 'Unknown Crop', style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text(price['market_name'] ?? 'N/A'),
                  trailing: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text('${price['price'] ?? 0} ${price['unit'] ?? ''}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          _buildTrendIcon(price['trend']?.toString() ?? ''),
                          const SizedBox(width: 4),
                          Text('${price['trend_percentage'] ?? 0}%', style: TextStyle(fontSize: 12, color: _getTrendColor(price['trend']?.toString() ?? ''))),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPriceAlertsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
          child: Text('market.price_alerts'.tr(), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        ),
        if (_priceAlerts.isEmpty)
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Center(child: Text('market.no_alerts'.tr())),
            ),
          )
        else
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _priceAlerts.length,
            itemBuilder: (context, index) {
              final alert = _priceAlerts[index];
              final isTriggered = alert['isTriggered'] as bool;
              return Card(
                elevation: 1,
                margin: const EdgeInsets.only(bottom: 8),
                color: isTriggered ? Colors.red.shade50 : null,
                child: ListTile(
                  leading: Icon(Icons.notifications, color: isTriggered ? Colors.red : Colors.orange),
                  title: Text(alert['cropName']),
                  subtitle: Text('Target: ${alert['targetPrice']} RWF'),
                  trailing: Text(
                    isTriggered ? 'market.triggered'.tr() : 'market.active'.tr(),
                    style: TextStyle(color: isTriggered ? Colors.red : Colors.green, fontWeight: FontWeight.bold),
                  ),
                ),
              );
            },
          ),
      ],
    );
  }

  Widget _buildTrendIcon(String trend) {
    if (trend == 'up') return const Icon(Icons.trending_up, color: Colors.green, size: 16);
    if (trend == 'down') return const Icon(Icons.trending_down, color: Colors.red, size: 16);
    return const Icon(Icons.trending_flat, color: Colors.grey, size: 16);
  }

  Color _getTrendColor(String trend) {
    if (trend == 'up') return Colors.green;
    if (trend == 'down') return Colors.red;
    return Colors.grey;
  }

  void _showAddAlertDialog() {
    final formKey = GlobalKey<FormState>();
    final priceController = TextEditingController();

    // Distinct crops available from the synced market prices, keyed by
    // crop_id — createPriceAlert requires a real cropId, not a free-text name.
    final crops = <String, String>{};
    for (final p in _marketPrices) {
      final id = p['crop_id']?.toString();
      final name = p['crop_name']?.toString();
      if (id != null && id.isNotEmpty && name != null && name.isNotEmpty) {
        crops[id] = name;
      }
    }

    if (crops.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No crop prices available yet. Pull to refresh first.')),
      );
      return;
    }

    String? selectedCropId = crops.keys.first;
    String alertType = 'above';
    bool isSubmitting = false;
    String? errorText;

    showDialog(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          title: Text('market.add_alert'.tr()),
          content: Form(
            key: formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                DropdownButtonFormField<String>(
                  value: selectedCropId,
                  decoration: InputDecoration(labelText: 'market.crop_name'.tr()),
                  items: crops.entries
                      .map((e) => DropdownMenuItem(value: e.key, child: Text(e.value)))
                      .toList(),
                  onChanged: (v) => setDialogState(() => selectedCropId = v),
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: priceController,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(labelText: 'market.target_price'.tr(), hintText: 'e.g., 400'),
                  validator: (v) => (v == null || v.isEmpty || double.tryParse(v) == null)
                      ? 'Please enter a valid price'
                      : null,
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<String>(
                  value: alertType,
                  decoration: const InputDecoration(labelText: 'Notify when price'),
                  items: const [
                    DropdownMenuItem(value: 'above', child: Text('Rises above target')),
                    DropdownMenuItem(value: 'below', child: Text('Falls below target')),
                  ],
                  onChanged: (v) => setDialogState(() => alertType = v!),
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
              child: Text('common.cancel'.tr()),
            ),
            ElevatedButton(
              onPressed: isSubmitting
                  ? null
                  : () async {
                      if (!(formKey.currentState?.validate() ?? false) || selectedCropId == null) {
                        return;
                      }
                      setDialogState(() {
                        isSubmitting = true;
                        errorText = null;
                      });
                      try {
                        await marketAlertsDataSource.createAlert(
                          cropId: selectedCropId!,
                          targetPrice: double.parse(priceController.text),
                          alertType: alertType,
                        );
                        if (!ctx.mounted) return;
                        Navigator.pop(dialogContext);
                        await _loadMarketData();
                        if (!mounted) return;
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('common.success'.tr())),
                        );
                      } catch (e) {
                        setDialogState(() {
                          isSubmitting = false;
                          errorText = 'Failed to create alert: $e';
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
                  : Text('common.add'.tr()),
            ),
          ],
        ),
      ),
    );
  }
}
