import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';

class MarketTrendChart extends StatelessWidget {
  final List<double> prices;
  final String cropName;

  const MarketTrendChart({Key? key, required this.prices, required this.cropName}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (prices.isEmpty) return const SizedBox();

    List<FlSpot> spots = [];
    for (int i = 0; i < prices.length; i++) {
      spots.add(FlSpot(i.toDouble(), prices[i]));
    }

    final double minPrice = prices.reduce((a, b) => a < b ? a : b) * 0.95;
    final double maxPrice = prices.reduce((a, b) => a > b ? a : b) * 1.05;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Text(
            '$cropName Price Trend (Last 7 Days)',
            style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.green),
          ),
        ),
        SizedBox(
          height: 100,
          child: LineChart(
            LineChartData(
              gridData: const FlGridData(show: false),
              titlesData: const FlTitlesData(show: false),
              borderData: FlBorderData(show: false),
              minX: 0,
              maxX: (spots.length - 1).toDouble(),
              minY: minPrice,
              maxY: maxPrice,
              lineBarsData: [
                LineChartBarData(
                  spots: spots,
                  isCurved: true,
                  color: Colors.green,
                  barWidth: 3,
                  isStrokeCapRound: true,
                  dotData: const FlDotData(show: false),
                  belowBarData: BarAreaData(
                    show: true,
                    color: Colors.green.withAlpha((0.1 * 255).toInt()),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
