import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:aguka_mobile/shared/data/local/database_helper.dart';
import 'package:aguka_mobile/shared/data/local/sync_service.dart';
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
    final alerts = <Map<String, dynamic>>[];
    
    if (!mounted) return;
    setState(() {
      _marketPrices = prices;
      _priceAlerts = alerts;
      _isLoading = false;
    });
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
                  title: Text(price['cropName'] ?? 'Unknown Crop', style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text(price['marketName'] ?? 'N/A'),
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
    final cropController = TextEditingController();
    final priceController = TextEditingController();
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('market.add_alert'.tr()),
        content: Form(
          key: formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: cropController,
                decoration: InputDecoration(labelText: 'market.crop_name'.tr(), hintText: 'e.g., Maize'),
                validator: (v) => (v == null || v.isEmpty) ? 'Please enter crop name' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: priceController,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(labelText: 'market.target_price'.tr(), hintText: 'e.g., 400'),
                validator: (v) => (v == null || v.isEmpty) ? 'Please enter price' : null,
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: Text('common.cancel'.tr())),
          ElevatedButton(
            onPressed: () {
              if (formKey.currentState?.validate() ?? false) {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('common.success'.tr())));
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
            child: Text('common.add'.tr()),
          ),
        ],
      ),
    );
  }
}
